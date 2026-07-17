import { CSSProperties, ChangeEvent, ClipboardEvent, DragEvent as ReactDragEvent, Fragment, KeyboardEvent, MouseEvent, PointerEvent as ReactPointerEvent, ReactNode, SyntheticEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUp as LucideArrowUp,
  AudioLines as LucideAudioLines,
  Bot as LucideBot,
  Brain as LucideBrain,
  Building2 as LucideBuilding2,
  Calendar as LucideCalendar,
  Check as LucideCheck,
  ChevronDown as LucideChevronDown,
  CornerDownRight as LucideCornerDownRight,
  Rocket as LucideRocket,
  Cloud as LucideCloud,
  Code as LucideCode,
  Copy as LucideCopy,
  Cpu as LucideCpu,
  ChevronRight as LucideChevronRight,
  ChevronUp as LucideChevronUp,
  Ellipsis as LucideEllipsis,
  FileText as LucideFileText,
  GitBranch as LucideGitBranch,
  Globe as LucideGlobe,
  Images as LucideImages,
  Layers as LucideLayers,
  ListTodo as LucideListTodo,
  Mail as LucideMail,
  MessageCircle as LucideMessageCircle,
  Maximize2 as LucideMaximize2,
  Minimize2 as LucideMinimize2,
  Monitor as LucideMonitor,
  LoaderCircle as LucideLoaderCircle,
  Palette as LucidePalette,
  Pencil as LucidePencil,
  Presentation as LucidePresentation,
  Plus as LucidePlus,
  RefreshCw as LucideRefreshCw,
  Eraser as LucideEraser,
  Split as LucideSplit,
  Star as LucideStar,
  Telescope as LucideTelescope,
  Terminal as LucideTerminal,
  TextQuote as LucideTextQuote,
  ThumbsDown as LucideThumbsDown,
  ThumbsUp as LucideThumbsUp,
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
import { PlatformSwitch } from "../platform-ui/components/ui/switch/index.js";
import { adaptLegacyThreadToProjection } from "../thread/legacy-adapter.js";
import type { RunnerThreadAction, RunnerThreadMessage, RunnerThreadProjection, RunnerThreadRoutedMessageResult, RunnerThreadRunStatus } from "../thread/types.js";
import { useRunnerExecution } from "./use-runner-execution.js";
import { getRunnerChatEnterAnimationStyle } from "./runner-chat-animations.js";
import { mountRunnerChatStyles } from "./runner-chat-styles.js";
import { RunnerThreadRunActivityCard } from "./thread/run-activity-card.js";
import { adaptRunnerThreadActionToRunnerLog } from "./thread/activity-action-list.js";
import { RunnerThreadUserMessageTime } from "./thread/thread-message.js";
import { useRunnerThreadProjection } from "./thread/use-runner-thread-projection.js";
import { useRunnerLogAutoScroll } from "./runner-chat/use-log-auto-scroll.js";
import { useRunnerThreadHistoryRail } from "./runner-chat/use-thread-history-rail.js";
import { RunnerDocumentPreviewDrawer } from "./runner-document-preview-drawer.js";
import {
  buildRunnerPreviewAttachmentFromPath,
  buildRunnerPreviewDownloadUrl,
  buildRunnerPreviewHtmlPreviewUrlFromDownloadUrl,
  buildRunnerPreviewHtmlPreviewUrl,
  inferRunnerPreviewMimeType,
  isRunnerPreviewHtmlFile,
  normalizeRunnerPreviewWorkspacePath,
  resolveRunnerPreviewAssetUrl,
  type RunnerImageUnderstandingPreviewData,
  type RunnerImageUnderstandingPreviewItem,
  type RunnerMediaGenerationPromptPreviewData,
  type RunnerPreviewAttachment,
  type RunnerWebSearchPreviewData,
  type RunnerWebSearchPreviewImage,
  type RunnerWebSearchPreviewSource,
} from "./runner-document-preview.js";
import { BrowserSkillLogBox, ComputerUseDetailDrawer, DeepResearchDetailDrawer, DeepResearchLogBox, InlineStatusLogBox, RunnerCodeViewer, RunnerWorkLogEntry, SubagentDetailDrawer, SubagentLogBox, hasActiveDeepResearchLogGroup, isBrowserSkillCommand, isBrowserSkillLaunchCommand, isComputerUseMcpLog, isDeepResearchCommand } from "../platform-ui/components/thread-components/log-boxes/index.js";
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
  getRecordObject,
  getRecordString,
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
  getRunnerComputerDisplayLabel,
  renderRunnerSummaryResourceChip,
  renderTurnAgentAvatar,
} from "./runner-chat/run-summary-presentation.js";
import {
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
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
  IconLoader2,
  IconLogout,
  IconMic,
  IconMusic,
  IconNotion,
  IconOneDrive,
  IconPaperclip,
  IconPlus,
  IconSearch,
  IconStop,
  IconUser,
  IconVideo,
  IconX,
} from "./runner-chat/icons.js";
import {
  isRunnerChatWebVoiceMode,
  normalizeRunnerChatVoiceMode,
  type RunnerAgentSelectorMode,
  type RunnerReasoningEffortId,
  type RunnerWorkspaceSelectorMode,
} from "./runner-chat/voice-audio.js";
import { buildRunnerVoiceHeaders } from "./runner-chat/voice-realtime-protocol.js";
import { useRunnerSpeechToText } from "./runner-chat/use-speech-to-text.js";
import { useRunnerVoiceModeSession } from "./runner-chat/use-voice-mode-session.js";
import {
  RUNNER_AD_ASPECT_RATIO_OPTIONS,
  RUNNER_AD_CREATION_DEFAULT_SETTINGS,
  RUNNER_AD_QUALITY_OPTIONS,
  RUNNER_AD_STYLE_OPTIONS,
  RUNNER_AD_VARIANT_OPTIONS,
  buildRunnerAdCreationLabel,
  buildRunnerAgentCreationLabel,
  buildRunnerBacklogSubtaskLabel,
  buildRunnerMissionControlLabel,
  buildRunnerParseCreationLabel,
  buildRunnerResearchCreationLabel,
  buildRunnerResourceCreationLabel,
  buildRunnerScrapeCreationLabel,
  buildRunnerSkillCreationLabel,
  buildRunnerSlideCreationLabel,
  buildStagedRunnerAdCreationCommand,
  formatRunnerAdCreationComputeTokens,
  getRunnerAdCreationQualityComputeTokensPerImage,
  normalizeRunnerAdCreationSettings,
  normalizeRunnerBacklogTicketNumber,
  parseAutoStageAdCreationCommand,
  parseAutoStageAgentCreationCommand,
  parseAutoStageBacklogMissionControlCommand,
  parseAutoStageBacklogSubtaskCommand,
  parseAutoStageParseCreationCommand,
  parseAutoStageResearchCreationCommand,
  parseAutoStageResourceCreationCommand,
  parseAutoStageScrapeCreationCommand,
  parseAutoStageSkillCreationCommand,
  parseAutoStageSlideCreationCommand,
  resolveRunnerSlashCommandInputState,
  type RunnerAdCreationAspectRatioId,
  type RunnerAdCreationQualityId,
  type RunnerAdCreationSettings,
  type RunnerAdCreationStyleId,
  type RunnerAdCreationVariantCount,
  type RunnerAgentCreationCommandType,
  type RunnerResourceCreationCommandType,
  type RunnerSkillCreationCommandType,
  type StagedAdCreationCommand,
  type StagedAgentCreationCommand,
  type StagedBacklogCommand,
  type StagedBacklogMissionControlCommand,
  type StagedBacklogSubtaskCommand,
  type StagedParseCreationCommand,
  type StagedResearchCreationCommand,
  type StagedResourceCreationCommand,
  type StagedScrapeCreationCommand,
  type StagedSkillCreationCommand,
  type StagedSlideCreationCommand,
} from "./runner-chat/composer-commands.js";
import {
  RUNNER_REASONING_EFFORT_OPTIONS,
  buildRunnerAgentGuardrailsHiddenPrompt,
  buildRunnerExecutionPromptWithHiddenContext,
  getRunnerAgentOptionPhotoUrl,
  getRunnerAgentOptionProviderType,
  getRunnerAgentProviderIcon,
  getRunnerAgentSelectorMode,
  getRunnerPreferredDefaultAgentOption,
  getRunnerProjectEnvironmentId,
  getRunnerReasoningEffortOption,
  isRunnerHumanAgentOption,
  isRunnerTeamAgentOption,
  mergeRunnerChatOptions,
  normalizeRunnerReasoningEffort,
  orderOptionsWithPinnedTop,
  type RunnerChatOption,
  type RunnerChatProjectOption,
} from "./runner-chat/agent-options.js";
export type {
  RunnerChatOption,
  RunnerChatProjectOption,
} from "./runner-chat/agent-options.js";
import type {
  LocalAttachment,
  RunnerAttachment,
  RunnerChatImplicitAttachment,
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
  getBrowserFileType,
  getGithubRepoName,
  isAttachmentDocumentPreviewable,
  parseGithubBrowserFolderId,
} from "./runner-chat/attachment-utils.js";
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
  sanitizeRunnerBudgetMessage,
  sanitizeRunnerMessage,
  type RunnerConversationMessage,
} from "./runner-chat/conversation-messages.js";
import {
  formatElapsedDurationLabel,
  parseSecondsFromClock,
  parseIsoTimestampMs,
} from "./runner-chat/time-utils.js";
import {
  buildRunnerHeaders,
  sanitizeBackendUrl,
} from "./runner-chat/api-utils.js";
import {
  cancelThreadExecution,
  createThread,
  DEFAULT_NEW_THREAD_TITLE,
  forkThreadRequest,
  type RunnerForkExistingEnvironmentFileCopyMode,
  type RunnerForkFileCopyMode,
  type RunnerForkTarget,
} from "./runner-chat/thread-api.js";
import {
  prepareGithubRepositorySelection,
  reportRunnerLifecycleCallbackError,
  startEnvironment,
} from "./runner-chat/environment-api.js";
import {
  blobToBase64,
  buildFileFromFetchedContent,
  decodeBase64TextContent,
  normalizeBase64Content,
  uploadAttachment,
  uploadAttachmentContent,
  type RunnerChatFetchedFileContent,
} from "./runner-chat/attachment-api.js";
export type {
  RunnerChatFetchedFileContent,
} from "./runner-chat/attachment-api.js";
import {
  fetchThreadFeedback,
  reportThreadFeedbackIssue,
  setThreadFeedback,
  type RunnerThreadFeedbackRating,
  type RunnerThreadFeedbackReportType,
  type RunnerThreadFeedbackState,
} from "./runner-chat/thread-feedback.js";
import {
  buildRunnerAttachmentFromPreviewAttachment,
  buildTurnAttachmentsFromLocalAttachments,
  buildTurnAttachmentsFromRunnerAttachments,
  isRunnerImagePreviewAttachment,
  isRunnerTurnDisplayHiddenAttachment,
  mergeRunnerTurnAttachments,
  normalizeTurnAttachment,
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
  fetchThreadResearchSessions,
} from "./runner-chat/hydration/api.js";
import {
  applyHydratedRunningThreadState,
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
  DEFAULT_THREAD_CONTEXT_ACTIONS,
  EMPTY_THREAD_CONTEXT_CATEGORIES,
  buildContextIndicatorTitle,
  deriveThreadContextDisplayMetrics,
  formatCompactTokenCount,
  formatThreadContextCommandText,
  getContextCategoryDisplayTokens,
  isThreadContextCommandPrompt,
  parseAutoStageThreadContextCommand,
  parseThreadContextCommand,
  stagedThreadContextCommandOffset,
  stagedThreadContextCommandTone,
  threadContextActionAllowsPrompt,
  threadContextCategoryColor,
  type ParsedThreadContextCommand,
  type RunnerChatThreadContext,
  type RunnerChatThreadContextAction,
  type RunnerChatThreadContextAvailableActions,
  type RunnerChatThreadContextCategory,
  type RunnerChatThreadContextCategoryKey,
  type RunnerChatThreadContextDetails,
} from "./runner-chat/thread-context-utils.js";
import {
  fetchRunnerThreadContext,
  fetchRunnerThreadContextDetails,
  requestRunnerThreadContextAction,
  streamRunnerThreadBtw,
} from "./runner-chat/thread-context-api.js";
import {
  getRunnerMissionControlAgentName,
  getRunnerMissionControlAgentPhotoUrl,
  renderRunnerMissionControlPreviewCard,
  renderRunnerTaskPreviewCard,
  type RunnerTaskPreview,
} from "./runner-chat/task-preview.js";
import {
  buildEnvironmentFileDownloadUrl,
  buildEnvironmentFileListUrl,
  buildWorkspaceSelectionStorageKey,
  childFolderPath,
  fileItemsForParent,
  formatBrowserFileDate,
  formatBrowserFileSize,
  isBrowserFilePreviewable,
  loadPersistedWorkspaceSelection,
  mergeDriveFolderItems,
  notionDatabasesToFileItems,
  normalizeEnvironmentWorkspaceItems,
  normalizeRunnerWorkspaceFolderPath,
  normalizeWorkspaceSelectorMode,
  persistWorkspaceSelection,
  type RunnerChatFileNode,
  type RunnerChatNotionDatabase,
} from "./runner-chat/workspace-files.js";
import {
  collectTurnChangedFiles,
} from "./runner-chat/turn-file-changes.js";
import {
  mapExpandedTurns,
} from "./runner-chat/turn-expansion.js";
import {
  normalizeRunnerFileBrowserSource,
  type RunnerFileBrowserSource,
} from "./runner-chat/file-browser-source.js";
import type {
  RunnerChatFollowUpAction,
  RunnerChatProps,
  RunnerChatSchedulePreset,
} from "./runner-chat/public-types.js";
export type {
  RunnerChatActionSummaryClickPayload,
  RunnerChatAgentTurnClickPayload,
  RunnerChatComputerAgentsConfig,
  RunnerChatDriveConfig,
  RunnerChatExternalFileBrowserRequest,
  RunnerChatExternalRunRequest,
  RunnerChatFollowUpAction,
  RunnerChatGithubConfig,
  RunnerChatInputMode,
  RunnerChatNotionConfig,
  RunnerChatProjectTaskSubmitPayload,
  RunnerChatProjectsConfig,
  RunnerChatProps,
  RunnerChatScheduleConfig,
  RunnerChatSchedulePreset,
  RunnerChatSummaryWorkspacePathClickPayload,
  RunnerChatWorkspaceConfig,
} from "./runner-chat/public-types.js";
export type {
  RunnerFileBrowserSource,
} from "./runner-chat/file-browser-source.js";
import { useRunnerExternalRunRequest } from "./runner-chat/execution/external-run-request.js";
import { useRunnerThinkingStatus } from "./runner-chat/use-thinking-status.js";
import {
  getRunnerTurnDurationSeconds,
  getRunnerTurnLiveWorkSummary,
} from "./runner-chat/turn-status-presentation.js";
import {
  buildRunnerOriginalActionLogIndex,
  resolveRunnerOriginalActionLog,
} from "./runner-chat/canonical-action-log-index.js";
import {
  buildRunnerTurnTimelineState,
} from "./runner-chat/turn-timeline-state.js";
import {
  useRunnerQueuedExecution,
  type RunnerPendingMessage,
} from "./runner-chat/execution/queued-execution.js";
import {
  getRunnerActiveRunInstructionNotice,
  persistRunnerActiveRunInstruction,
} from "./runner-chat/execution/active-run-instruction.js";
import { RunnerPageQueueReceipt } from "./runner-chat/execution/page-queue-receipt.js";
import { createRunnerThreadRunExecutor } from "./runner-chat/execution/thread-run-executor.js";
import { RunnerCanonicalThreadSurface } from "./runner-chat/canonical-thread-surface.js";
import { adaptRunnerThreadPermissionRequestToRunnerLog } from "./runner-chat/permission-log-adapter.js";
import { RunnerFileBrowserDialog } from "./runner-chat/file-browser-dialog.js";
import {
  RunnerEditConfirmationDialog,
  RunnerForkThreadDialog,
  RunnerReportIssueDialog,
} from "./runner-chat/workflow-dialogs.js";
import {
  getRunnerComposerPlanDisplay,
} from "./runner-chat/composer-plan.js";
import {
  POPUP_ANIMATION_DURATION_MS,
  RUNNER_COMPOSER_POPUP_OPEN_EVENT,
  emitRunnerComposerPopupOpen,
  getMainPopupRenderId,
  getRunnerComposerPopupEventSource,
  getSidePopupRenderId,
  isPlusPopupId,
  renderComposerPopupPortal,
  useComposerAnchoredPopupStyle,
  type InputPopupId,
  type MainPopupRenderId,
  type PopupAnimationPhase,
  type SidePopupExitDirection,
  type SidePopupRenderId,
} from "./runner-chat/composer-popup.js";
import {
  extractDeepResearchSessionIdFromLogs,
  extractDeepResearchTopicFromGroup,
  isDeepResearchSessionActive,
  resolveDeepResearchSessionForGroup,
} from "./runner-chat/deep-research-session.js";
import {
  buildRunnerImageSelectionInpaintPrompt,
  createRunnerImageSelectionMaskFile,
  type RunnerImagePreviewSelectionState,
} from "./runner-chat/image-selection.js";
import {
  getRunnerLogRangeDurationLabel,
  getRunnerLogTimestampMs,
  isBtwTurnPrompt,
  runnerExecutionStatusTone as statusTone,
  toRunnerLogDurationLabel as toDurationLabel,
} from "./runner-chat/log-presentation.js";
import {
  areStringArraysEqual,
  buildEnabledSkillsPayload,
  buildEnabledSkillsStorageKey,
  customSkillIconComponent,
  defaultEnabledSkillIds,
  loadPersistedEnabledSkillIds,
  normalizeComputerAgentSkills,
  normalizeEnabledSkillIdList,
  normalizeRunnerSkillId,
  persistEnabledSkillIds,
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

const RUNNER_FOLDER_ICON_URL = new URL("./assets/folder.png", import.meta.url).toString();
const RUNNER_TEXT_FILE_ICON_URL = new URL("./assets/txtfile.png", import.meta.url).toString();
const RUNNER_IMAGE_FILE_ICON_URL = new URL("./assets/imgicon.webp", import.meta.url).toString();
const RUNNER_EMAIL_ATTACHMENT_FILE_ICON_URL = new URL("./assets/email-attachment.webp", import.meta.url).toString();
const RUNNER_TRANSPARENT_LOGO_URL = "https://computer-agents.com/img/logos/runnertransparent.png";
const RUNNER_WORK_LOG_PAGE_SIZE = 10;
// Live runs stay intentionally quiet at the conversation altitude. The header
// carries the current semantic summary; concrete actions are mounted only when
// the user expands the run.
const RUNNER_LIVE_WORK_LOG_PREVIEW_COUNT = 0;

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

interface PendingForkConfiguration {
  source: "message" | "thread";
  sourceThreadId: string;
  stagedPrompt: string;
  attachments?: LocalAttachment[];
  quotedSelection?: RunnerQuotedSelection | null;
  turn?: RunnerTurn;
  restoreSelectedEnvironmentId?: string | null;
}

const COMPOSER_QUOTED_SELECTION_ANIMATION_MS = 220;

function renderRunnerAgentOptionIcon(agent: RunnerChatOption): ReactNode {
  const providerIcon = getRunnerAgentProviderIcon(getRunnerAgentOptionProviderType(agent));
  if (!providerIcon) {
    return <IconUser className="tb-popup-icon" />;
  }
  const className = ["tb-popup-icon", "tb-popup-provider-icon", providerIcon.className || ""]
    .filter(Boolean)
    .join(" ");
  return (
    <img
      className={className}
      src={providerIcon.src}
      alt=""
      title={providerIcon.alt}
      aria-hidden="true"
      draggable={false}
    />
  );
}

const DEFAULT_SCHEDULE_PRESETS: RunnerChatSchedulePreset[] = [
  { id: "daily", label: "Every day", cron: "0 9 * * *" },
  { id: "weekdays", label: "Every weekday", cron: "0 9 * * 1-5" },
  { id: "weekly", label: "Every week", cron: "0 9 * * 1" },
];

const ATTACH_FILES_SHORTCUT_KEY = "u";
const SCHEDULE_SHORTCUT_KEY = "s";

function renderBrowserFileIcon(file: RunnerChatFileNode, className: string) {
  if (file.isFolder) {
    return <img src={RUNNER_FOLDER_ICON_URL} alt="" aria-hidden="true" draggable={false} className={`${className} tb-file-browser-icon-asset`} />;
  }

  if (file.mimeType === "application/x-notion-database" || file.mimeType === "application/x-notion-workspace") {
    return <IconNotion className={className} />;
  }

  const fileType = getBrowserFileType(file.mimeType, file.name);
  if (fileType === "image") {
    return <img src={RUNNER_IMAGE_FILE_ICON_URL} alt="" aria-hidden="true" draggable={false} className={`${className} tb-file-browser-icon-asset`} />;
  }
  if (fileType === "video") {
    return <IconVideo className={`${className} tb-file-browser-item-icon-video`} />;
  }
  if (fileType === "audio") {
    return <IconMusic className={`${className} tb-file-browser-item-icon-audio`} />;
  }
  return <img src={RUNNER_TEXT_FILE_ICON_URL} alt="" aria-hidden="true" draggable={false} className={`${className} tb-file-browser-icon-asset`} />;
}

function formatDateTimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatScheduleChipLabel(schedule: { scheduledTime: Date; scheduleType: "one-time" | "recurring" }): string {
  if (schedule.scheduleType === "recurring") {
    return "Recurring";
  }

  return `${schedule.scheduledTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${schedule.scheduledTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

function defaultAttachmentFromFile(file: File): RunnerAttachment {
  return {
    id: generateId("att"),
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    type: file.type.startsWith("image/") ? "image" : "document",
    uploadedAt: new Date().toISOString(),
  };
}

export function RunnerChat({
  backendUrl,
  apiKey,
  speechToTextUrl,
  fetchCustomSkills,
  requestHeaders,
  environmentId,
  projectId,
  agentId,
  appId = "runner-web-sdk",
  threadId,
  title,
  threadMetadata = null,
  threadViewMode = "auto",
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
  isAgentSelectionBlocked,
  onBlockedAgentSelect,
  reasoningEffort: controlledReasoningEffort,
  onReasoningEffortChange,
  environments = [],
  hideEnvironmentSelector = false,
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
  onExternalRunRequestHandled,
  onExternalRunRequestCreate,
  autoFocusComposer = false,
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
  onOpenPlansBudget,
  onBacklogMissionControlSubmit,
  followUpActions = [],
  followUpError = "",
  renderUserPromptContent,
  renderRunSummaryJsonSegment,
}: RunnerChatProps) {
  const [input, setInput] = useState(initialTask);
  const [inputSelectionStart, setInputSelectionStart] = useState(() => initialTask.length);
  const [composerQuotedSelection, setComposerQuotedSelection] = useState<RunnerQuotedSelection | null>(null);
  const [renderedComposerQuotedSelection, setRenderedComposerQuotedSelection] = useState<RunnerQuotedSelection | null>(null);
  const [isComposerQuotedSelectionVisible, setIsComposerQuotedSelectionVisible] = useState(false);
  const [localThreadId, setLocalThreadId] = useState<string | null>(threadId ?? null);
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const [previewedDocumentAttachment, setPreviewedDocumentAttachment] = useState<RunnerTurnAttachment | null>(null);
  const [previewImageSelectionState, setPreviewImageSelectionState] = useState<RunnerImagePreviewSelectionState | null>(null);
  const [isDocumentPreviewMaximized, setIsDocumentPreviewMaximized] = useState(false);
  const [documentPreviewActionMenuOpen, setDocumentPreviewActionMenuOpen] = useState(false);
  const [selectedSubagentDetail, setSelectedSubagentDetail] = useState<RunnerSelectedSubagentDetail | null>(null);
  const [selectedDeepResearchDetail, setSelectedDeepResearchDetail] = useState<RunnerSelectedDeepResearchDetail | null>(null);
  const [selectedComputerUseDetail, setSelectedComputerUseDetail] = useState<RunnerSelectedComputerUseDetail | null>(null);
  const [documentPreviewDrawerWidth, setDocumentPreviewDrawerWidth] = useState<number | null>(null);
  const [isThreadHistoryLoading, setIsThreadHistoryLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isPreparingRun, setIsPreparingRun] = useState(false);
  const [turns, setTurns] = useState<RunnerTurn[]>([]);
  const [deepResearchSessions, setDeepResearchSessions] = useState<RunnerDeepResearchSession[]>([]);
  const [hydratedThreadStatus, setHydratedThreadStatus] = useState<string | null>(null);
  const {
    thinkingStatusPhaseByTurn,
    visibleTimelineItemCountsByTurn,
    visibleWorkLogItemCountsByTurn,
    setVisibleWorkLogItemCountsByTurn,
  } = useRunnerThinkingStatus({
    turns,
    getTurnTimelineState,
  });
  const [pendingQueuedMessages, setPendingQueuedMessages] = useState<RunnerPendingMessage[]>([]);
  const [editingTurnId, setEditingTurnId] = useState<string | null>(null);
  const [editingTurnDraft, setEditingTurnDraft] = useState("");
  const [forkingTurnId, setForkingTurnId] = useState<string | null>(null);
  const [threadFeedback, setThreadFeedbackState] = useState<RunnerThreadFeedbackState>({
    userRating: null,
    upCount: 0,
    downCount: 0,
    reportCount: 0,
    isSubmitting: false,
  });
  const [runSummaryMoreTurnId, setRunSummaryMoreTurnId] = useState<string | null>(null);
  const [emailDeliveryAttachmentsTurnId, setEmailDeliveryAttachmentsTurnId] = useState<string | null>(null);
  const [reportIssueTurn, setReportIssueTurn] = useState<{ turnId: string; summaryText: string } | null>(null);
  const [reportIssueType, setReportIssueType] = useState<RunnerThreadFeedbackReportType>("bug");
  const [reportIssueMessage, setReportIssueMessage] = useState("");
  const [reportIssueError, setReportIssueError] = useState("");
  const [isReportIssueSubmitting, setIsReportIssueSubmitting] = useState(false);
  const [pendingForkConfiguration, setPendingForkConfiguration] = useState<PendingForkConfiguration | null>(null);
  const [forkTarget, setForkTarget] = useState<RunnerForkTarget>("existing_environment");
  const [forkTargetEnvironmentId, setForkTargetEnvironmentId] = useState<string>(environmentId ?? "");
  const [forkNewEnvironmentName, setForkNewEnvironmentName] = useState("");
  const [forkNewEnvironmentFileCopyMode, setForkNewEnvironmentFileCopyMode] = useState<RunnerForkFileCopyMode>("all");
  const [forkExistingEnvironmentFileCopyMode, setForkExistingEnvironmentFileCopyMode] = useState<RunnerForkExistingEnvironmentFileCopyMode>("none");
  const [showForkEnvironmentPopup, setShowForkEnvironmentPopup] = useState(false);
  const [forkDialogError, setForkDialogError] = useState<string | null>(null);
  const [pendingEditConfirmation, setPendingEditConfirmation] = useState<PendingEditConfirmation | null>(null);
  const [expandedTurns, setExpandedTurns] = useState<Record<string, boolean>>({});
  const [expandedStepRows, setExpandedStepRows] = useState<Record<string, boolean>>({});
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [activeInputPopup, setActiveInputPopup] = useState<InputPopupId | null>(null);
  const composerPopupSourceIdRef = useRef(`runner-chat:${Math.random().toString(36).slice(2)}`);
  const [selectedWorkspaceFileIds, setSelectedWorkspaceFileIds] = useState<string[]>([]);
  const [showFileBrowserModal, setShowFileBrowserModal] = useState(false);
  const [showFileBrowserApiKeyPrompt, setShowFileBrowserApiKeyPrompt] = useState(false);
  const [fileBrowserSource, setFileBrowserSource] = useState<RunnerFileBrowserSource>("workspace");
  const [fileBrowserSearchQuery, setFileBrowserSearchQuery] = useState("");
  const [fileBrowserPreviewId, setFileBrowserPreviewId] = useState<string | null>(null);
  const [expandedFileBrowserFolderIds, setExpandedFileBrowserFolderIds] = useState<string[]>([]);
  const [fileBrowserPreviewContent, setFileBrowserPreviewContent] = useState<string | null>(null);
  const [fileBrowserPreviewKind, setFileBrowserPreviewKind] = useState<"image" | "video" | "text" | null>(null);
  const [isFileBrowserPreviewLoading, setIsFileBrowserPreviewLoading] = useState(false);
  const [isFileBrowserAttaching, setIsFileBrowserAttaching] = useState(false);
  const [fileBrowserHistory, setFileBrowserHistory] = useState<Array<{ source: RunnerFileBrowserSource; folderId: string | null }>>([]);
  const [fileBrowserHistoryIndex, setFileBrowserHistoryIndex] = useState(-1);
  const lastExternalFileBrowserRequestTokenRef = useRef("");
  const [remoteWorkspaceItems, setRemoteWorkspaceItems] = useState<RunnerChatFileNode[]>([]);
  const [loadedWorkspaceFolderIds, setLoadedWorkspaceFolderIds] = useState<string[]>([]);
  const [loadingWorkspaceFolderIds, setLoadingWorkspaceFolderIds] = useState<string[]>([]);
  const [workspaceFolderErrorsById, setWorkspaceFolderErrorsById] = useState<Record<string, string>>({});
  const [remoteGoogleDriveItems, setRemoteGoogleDriveItems] = useState<RunnerChatFileNode[]>([]);
  const [remoteOneDriveItems, setRemoteOneDriveItems] = useState<RunnerChatFileNode[]>([]);
  const [remoteGithubItems, setRemoteGithubItems] = useState<RunnerChatFileNode[]>([]);
  const [remoteNotionDatabases, setRemoteNotionDatabases] = useState<RunnerChatNotionDatabase[]>([]);
  const [notionDatabasesLoaded, setNotionDatabasesLoaded] = useState(false);
  const [loadedGoogleDriveFolderIds, setLoadedGoogleDriveFolderIds] = useState<string[]>([]);
  const [loadedOneDriveFolderIds, setLoadedOneDriveFolderIds] = useState<string[]>([]);
  const [loadedGithubFolderIds, setLoadedGithubFolderIds] = useState<string[]>([]);
  const [loadingGoogleDriveFolderIds, setLoadingGoogleDriveFolderIds] = useState<string[]>([]);
  const [loadingOneDriveFolderIds, setLoadingOneDriveFolderIds] = useState<string[]>([]);
  const [loadingGithubFolderIds, setLoadingGithubFolderIds] = useState<string[]>([]);
  const [isGoogleDriveBrowserLoading, setIsGoogleDriveBrowserLoading] = useState(false);
  const [isOneDriveBrowserLoading, setIsOneDriveBrowserLoading] = useState(false);
  const [isGithubBrowserLoading, setIsGithubBrowserLoading] = useState(false);
  const [isNotionBrowserLoading, setIsNotionBrowserLoading] = useState(false);
  const [isGoogleDrivePickerLoading, setIsGoogleDrivePickerLoading] = useState(false);
  const [googleDriveBrowserError, setGoogleDriveBrowserError] = useState<string | null>(null);
  const [oneDriveBrowserError, setOneDriveBrowserError] = useState<string | null>(null);
  const [githubBrowserError, setGithubBrowserError] = useState<string | null>(null);
  const [notionBrowserError, setNotionBrowserError] = useState<string | null>(null);
  const [threadContext, setThreadContext] = useState<RunnerChatThreadContext | null>(null);
  const [isThreadContextLoading, setIsThreadContextLoading] = useState(false);
  const [threadContextDetails, setThreadContextDetails] = useState<RunnerChatThreadContextDetails | null>(null);
  const [threadContextDetailsError, setThreadContextDetailsError] = useState<string | null>(null);
  const [threadContextNativeError, setThreadContextNativeError] = useState<string | null>(null);
  const [isThreadContextDetailsLoading, setIsThreadContextDetailsLoading] = useState(false);
  const [threadContextActionLoading, setThreadContextActionLoading] = useState<RunnerChatThreadContextAction | null>(null);
  const [threadContextAvailableActions, setThreadContextAvailableActions] = useState<RunnerChatThreadContextAvailableActions>(DEFAULT_THREAD_CONTEXT_ACTIONS);
  const [isWorkspaceBrowserLoading, setIsWorkspaceBrowserLoading] = useState(false);
  const [workspaceBrowserError, setWorkspaceBrowserError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isScreenFileDragActive, setIsScreenFileDragActive] = useState(false);
  const [scheduleType, setScheduleType] = useState<"one-time" | "recurring">("one-time");
  const [scheduledAtValue, setScheduledAtValue] = useState(() => formatDateTimeLocalValue(new Date(Date.now() + 60 * 60 * 1000)));
  const [selectedSchedulePresetId, setSelectedSchedulePresetId] = useState<string>(() => DEFAULT_SCHEDULE_PRESETS[0]?.id || "");
  const [skillsTab, setSkillsTab] = useState<"system" | "custom">("system");
  const [scheduledTask, setScheduledTask] = useState<{
    scheduledTime: Date;
    scheduleType: "one-time" | "recurring";
    cronExpression?: string;
  } | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(() => {
    if (agentId) return agentId;
    return getRunnerPreferredDefaultAgentOption(agents)?.id || "";
  });
  const [agentPopupMode, setAgentPopupMode] = useState<RunnerAgentSelectorMode>(() =>
    getRunnerAgentSelectorMode(agents.find((agent) => agent.id === agentId) || getRunnerPreferredDefaultAgentOption(agents))
  );
  const [selectedReasoningEffort, setSelectedReasoningEffort] = useState<RunnerReasoningEffortId>(() =>
    normalizeRunnerReasoningEffort(controlledReasoningEffort)
  );
  const hasInitializedOpenAgentPopupModeRef = useRef(false);
  const [activeThreadEnvironmentId, setActiveThreadEnvironmentId] = useState<string | null>(null);
  const [activeThreadEnvironmentName, setActiveThreadEnvironmentName] = useState<string | null>(null);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string>(() => {
    if (environmentId) return environmentId;
    return environments.find((environment) => environment.isDefault)?.id || environments[0]?.id || "";
  });
  const [workspaceSelectorMode, setWorkspaceSelectorMode] = useState<RunnerWorkspaceSelectorMode>(() => {
    return loadPersistedWorkspaceSelection(buildWorkspaceSelectionStorageKey(appId, backendUrl))?.mode || "computers";
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    const persisted = loadPersistedWorkspaceSelection(buildWorkspaceSelectionStorageKey(appId, backendUrl));
    return persisted?.mode === "projects" ? persisted.projectId : "";
  });
  const [initialAgentTopId, setInitialAgentTopId] = useState<string | null>(null);
  const [initialEnvironmentTopId, setInitialEnvironmentTopId] = useState<string | null>(null);
  const [enabledSkillIds, setEnabledSkillIds] = useState<string[]>(() => {
    const controlled = normalizeEnabledSkillIdList(controlledEnabledSkillIds);
    if (controlled !== null) {
      return controlled;
    }
    const storageKey = buildEnabledSkillsStorageKey(appId);
    const persisted = loadPersistedEnabledSkillIds(storageKey);
    if (persisted !== null) {
      return persisted;
    }
    return defaultEnabledSkillIds(normalizeComputerAgentSkills(skills));
  });
  const [selectedGithubRepositoryId, setSelectedGithubRepositoryId] = useState<string>(() => computerAgents?.github?.selectedRepositoryId || "");
  const [selectedGithubContextId, setSelectedGithubContextId] = useState<string>(() => computerAgents?.github?.selectedContextId || "");
  const [selectedNotionDatabaseId, setSelectedNotionDatabaseId] = useState<string>(() => computerAgents?.notion?.selectedDatabaseId || "");
  const [customSkills, setCustomSkills] = useState<RunnerChatSkill[]>([]);
  const [isLoadingCustomSkills, setIsLoadingCustomSkills] = useState(false);
  const [customSkillsLoaded, setCustomSkillsLoaded] = useState(false);
  const [googleDriveFolderId, setGoogleDriveFolderId] = useState<string | null>(null);
  const [oneDriveFolderId, setOneDriveFolderId] = useState<string | null>(null);
  const [selectedGoogleDriveFileIds, setSelectedGoogleDriveFileIds] = useState<string[]>([]);
  const [selectedOneDriveFileIds, setSelectedOneDriveFileIds] = useState<string[]>([]);
  const [selectedGithubFileIds, setSelectedGithubFileIds] = useState<string[]>([]);
  const [githubBranchesByRepoFullName, setGithubBranchesByRepoFullName] = useState<Record<string, RunnerChatOption[]>>({});
  const [githubSelectedBranchByRepoFullName, setGithubSelectedBranchByRepoFullName] = useState<Record<string, string>>({});
  const [githubBranchLoadingRepoFullNames, setGithubBranchLoadingRepoFullNames] = useState<string[]>([]);
  const [stagedThreadContextCommand, setStagedThreadContextCommand] = useState<RunnerChatThreadContextAction | null>(null);
  const [stagedResourceCreationCommand, setStagedResourceCreationCommand] = useState<StagedResourceCreationCommand | null>(null);
  const [stagedAgentCreationCommand, setStagedAgentCreationCommand] = useState<StagedAgentCreationCommand | null>(null);
  const [stagedSkillCreationCommand, setStagedSkillCreationCommand] = useState<StagedSkillCreationCommand | null>(null);
  const [stagedSlideCreationCommand, setStagedSlideCreationCommand] = useState<StagedSlideCreationCommand | null>(null);
  const [stagedResearchCreationCommand, setStagedResearchCreationCommand] = useState<StagedResearchCreationCommand | null>(null);
  const [stagedScrapeCreationCommand, setStagedScrapeCreationCommand] = useState<StagedScrapeCreationCommand | null>(null);
  const [stagedParseCreationCommand, setStagedParseCreationCommand] = useState<StagedParseCreationCommand | null>(null);
  const [stagedAdCreationCommand, setStagedAdCreationCommand] = useState<StagedAdCreationCommand | null>(null);
  const [adCreationSettings, setAdCreationSettings] = useState<RunnerAdCreationSettings>(RUNNER_AD_CREATION_DEFAULT_SETTINGS);
  const [stagedBacklogSubtaskCommand, setStagedBacklogSubtaskCommand] = useState<StagedBacklogSubtaskCommand | null>(null);
  const [stagedBacklogMissionControlCommand, setStagedBacklogMissionControlCommand] = useState<StagedBacklogMissionControlCommand | null>(null);
  const [renderedMainPopup, setRenderedMainPopup] = useState<MainPopupRenderId | null>(null);
  const [mainPopupPhase, setMainPopupPhase] = useState<PopupAnimationPhase>("idle");
  const [renderedSidePopup, setRenderedSidePopup] = useState<SidePopupRenderId | null>(null);
  const [sidePopupPhase, setSidePopupPhase] = useState<PopupAnimationPhase>("idle");
  const [sidePopupExitDirection, setSidePopupExitDirection] = useState<SidePopupExitDirection>("left");
  const [quotedSelectionPopup, setQuotedSelectionPopup] = useState<RunnerQuotedSelectionPopupState | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logsRef = useRef<HTMLDivElement | null>(null);
  const contentWidthRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
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
  const rootRef = useRef<HTMLDivElement | null>(null);
  const forkEnvironmentPopupRef = useRef<HTMLDivElement | null>(null);
  const runSummaryMoreMenuRef = useRef<HTMLSpanElement | null>(null);
  const emailDeliveryAttachmentsPopoverRef = useRef<HTMLSpanElement | null>(null);
  const currentInputRef = useRef(initialTask);
  const fileBrowserPreviewObjectUrlRef = useRef<string | null>(null);
  const documentPreviewResizeStateRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const documentPreviewActionMenuRef = useRef<HTMLSpanElement | null>(null);
  const mainPopupAnimationTimerRef = useRef<number | null>(null);
  const sidePopupAnimationTimerRef = useRef<number | null>(null);
  const isDrainingQueuedRunsRef = useRef(false);
  const attachmentsRef = useRef<LocalAttachment[]>([]);
  const attachmentUploadPromisesRef = useRef<Record<string, Promise<RunnerAttachment> | undefined>>({});
  const githubPreparationPromisesRef = useRef<Record<string, Promise<void> | undefined>>({});
  const turnsRef = useRef<RunnerTurn[]>([]);
  const threadHydrationCacheRef = useRef<RunnerThreadHydrationPayload | null>(null);
  const notifiedTaskListLogKeysRef = useRef<Set<string>>(new Set());
  const initializedThreadHistoryIdRef = useRef<string | null>(null);
  const locallyOwnedExecutionThreadIdRef = useRef<string | null>(null);
  const lastEnvironmentStartRequestKeyRef = useRef<string | null>(null);
  const quotedSelectionPopupRef = useRef<HTMLDivElement | null>(null);
  const composerQuotedSelectionAnimationTimerRef = useRef<number | null>(null);
  const appliedBacklogSubtaskCommandTokenRef = useRef<string | number | null>(null);
  const appliedBacklogMissionControlCommandTokenRef = useRef<string | number | null>(null);
  const appliedResourceCreationCommandTokenRef = useRef<string | number | null>(null);
  const appliedAgentCreationCommandTokenRef = useRef<string | number | null>(null);
  const appliedSkillCreationCommandTokenRef = useRef<string | number | null>(null);
  const handledExternalRunRequestTokenRef = useRef<string | number | null>(null);
  const handledInitialDocumentPreviewTokenRef = useRef<string | number | null>(null);
  const workspacePreferenceAppliedRef = useRef(false);
  const lastAppliedControlledProjectIdRef = useRef<string | null>(null);
  const stopRequestedThreadIdRef = useRef<string | null>(null);
  const [isStoppingRun, setIsStoppingRun] = useState(false);
  const screenFileDragActiveRef = useRef(false);

  const { status, logs, execute, cancel, clear, result } = useRunnerExecution({ clearLogsOnExecute: false });

  const normalizedBackendUrl = useMemo(() => sanitizeBackendUrl(backendUrl), [backendUrl]);
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
  const normalizedSkills = useMemo(() => normalizeComputerAgentSkills(skills), [skills]);
  const displayedSkills = useMemo(() => [...normalizedSkills, ...customSkills], [customSkills, normalizedSkills]);
  const controlledEnabledSkillIdsList = useMemo(
    () => normalizeEnabledSkillIdList(controlledEnabledSkillIds),
    [controlledEnabledSkillIds]
  );
  const enabledSkillsStorageKey = useMemo(() => buildEnabledSkillsStorageKey(appId), [appId]);
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
  const schedulePresets = scheduleConfig?.presets?.length ? scheduleConfig.presets : DEFAULT_SCHEDULE_PRESETS;
  const githubRepositories = githubConfig?.repositories || [];
  const githubContexts = githubConfig?.contexts || [];
  const notionDatabases = notionConfig?.fetchDatabases ? remoteNotionDatabases : notionConfig?.databases || [];
  const googleDriveItems = googleDriveConfig?.fetchItems ? remoteGoogleDriveItems : googleDriveConfig?.items || [];
  const oneDriveItems = oneDriveConfig?.fetchItems ? remoteOneDriveItems : oneDriveConfig?.items || [];
  const githubItems = githubConfig?.fetchItems ? remoteGithubItems : [];
  const notionItems = notionDatabasesToFileItems(notionDatabases);
  const currentThreadId = threadId ?? localThreadId;
  const hasCurrentThread = Boolean(currentThreadId);
  const legacyTurnProjectionCacheRef = useRef(new Map<string, {
    projection: RunnerThreadProjection;
    logCount: number;
    status: RunnerTurnStatus;
  }>());
  const legacyTurnProjectionsById = useMemo(() => {
    const projections = new Map<string, ReturnType<typeof adaptLegacyThreadToProjection>>();
    const liveTurnIds = new Set(turns.map((turn) => turn.id));
    for (const cachedTurnId of legacyTurnProjectionCacheRef.current.keys()) {
      if (!liveTurnIds.has(cachedTurnId)) legacyTurnProjectionCacheRef.current.delete(cachedTurnId);
    }
    for (const turn of turns) {
      const cached = legacyTurnProjectionCacheRef.current.get(turn.id);
      const newLogs = cached ? turn.logs.slice(cached.logCount) : turn.logs;
      const hasPriorityProjectionChange = newLogs.some((log) =>
        log.type === "error" ||
        log.eventType === "permission_request" ||
        log.eventType === "action_summary" ||
        log.eventType === "turn_completed" ||
        log.eventType === "planning"
      );
      const canReuseCachedProjection = Boolean(
        cached &&
        cached.status === turn.status &&
        turn.logs.length >= cached.logCount &&
        turn.logs.length - cached.logCount < 8 &&
        !hasPriorityProjectionChange
      );
      if (cached && canReuseCachedProjection) {
        projections.set(turn.id, cached.projection);
        continue;
      }
      const projectionThreadId = String(currentThreadId || `local:${turn.id}`).trim();
      const logRunId = turn.logs.find((log) => typeof log.metadata?.runId === "string" && log.metadata.runId.trim())?.metadata?.runId;
      const runId = String(logRunId || `legacy:${projectionThreadId}:${turn.id}`).trim();
      const runStatus: RunnerThreadRunStatus = turn.status === "permission_asked" ? "requires_action" : turn.status;
      const finalAssistantLog = [...turn.logs].reverse().find((log) => (
        (log.eventType === "agent_message" || log.eventType === "llm_response") && log.message.trim()
      ));
      const finalAssistantMessageId = typeof (finalAssistantLog?.metadata as Record<string, unknown> | undefined)?.messageId === "string"
        ? String((finalAssistantLog?.metadata as Record<string, unknown>).messageId)
        : `${turn.id}:assistant`;
      const projection = adaptLegacyThreadToProjection({
        threadId: projectionThreadId,
        runId,
        runStatus,
        runTitle: turn.prompt,
        runMetadata: turn.status === "queued"
          ? { pageResidentQueue: true, coordinatorDurable: false }
          : null,
        logs: turn.logs,
        messages: [
          ...(turn.prompt.trim() ? [{
            id: turn.sourceMessageId || `${turn.id}:prompt`,
            role: "user" as const,
            content: turn.prompt,
            createdAt: new Date(turn.startedAtMs).toISOString(),
            metadata: turn.messageMetadata || null,
          }] : []),
          ...(finalAssistantLog ? [{
            id: finalAssistantMessageId,
            role: "assistant" as const,
            content: finalAssistantLog.message,
            createdAt: finalAssistantLog.createdAt || finalAssistantLog.time || new Date(turn.completedAtMs || Date.now()).toISOString(),
            metadata: finalAssistantLog.metadata || null,
          }] : []),
        ],
        startedAt: new Date(turn.startedAtMs).toISOString(),
        completedAt: turn.completedAtMs ? new Date(turn.completedAtMs).toISOString() : null,
      });
      legacyTurnProjectionCacheRef.current.set(turn.id, {
        projection,
        logCount: turn.logs.length,
        status: turn.status,
      });
      projections.set(turn.id, projection);
    }
    return projections;
  }, [currentThreadId, turns]);
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
  const activeDeepResearchThreadSession = useMemo(() => {
    const activeSessions = deepResearchSessions.filter((session) => isDeepResearchSessionActive(session));
    if (activeSessions.length === 0) {
      return null;
    }
    return activeSessions
      .slice()
      .sort((left, right) => {
        const leftMs = parseIsoTimestampMs(left.startedAt) ?? parseIsoTimestampMs(left.createdAt) ?? 0;
        const rightMs = parseIsoTimestampMs(right.startedAt) ?? parseIsoTimestampMs(right.createdAt) ?? 0;
        return rightMs - leftMs;
      })[0] || null;
  }, [deepResearchSessions]);
  const hasActiveDeepResearchSession = Boolean(activeDeepResearchThreadSession);
  const shouldRefreshDeepResearchSessions = currentThreadHasDeepResearchActivity || Boolean(selectedDeepResearchDetail);
  const shouldPollDeepResearchSessions = currentThreadHasActiveDeepResearchLogs || hasActiveDeepResearchSession;
  const hasHydratedReattachActivity = useMemo(
    () => hasActiveDeepResearchSession || turns.some((turn) => isActiveTurnStatus(turn.status) || hasActiveDeepResearchLogGroup(turn.logs)),
    [hasActiveDeepResearchSession, turns]
  );
  const hasRunningTurnLogs = Boolean(activeRunningTurn && activeRunningTurn.logs.length > 0);
  const showRunPreparationIndicator = isPreparingRun && !hasRunningTurn && !isRunning && !isStoppingRun;
  const showActiveRunStopButton =
    !showRunPreparationIndicator &&
    (hasRunningTurn || hydratedThreadIsRunning || hasActiveDeepResearchSession || isRunning || isStoppingRun);
  useEffect(() => {
    if (!currentThreadId || !hasRunningTurn || hydratedThreadIsRunning) {
      return;
    }

    setHydratedThreadStatus("running");
    try {
      onThreadStatusChange?.(currentThreadId, "running");
    } catch (error) {
      reportRunnerLifecycleCallbackError("onThreadStatusChange", error);
    }
  }, [currentThreadId, hasRunningTurn, hydratedThreadIsRunning, onThreadStatusChange]);
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
  const stagedBacklogCommand = stagedBacklogMissionControlCommand || stagedBacklogSubtaskCommand;
  const stagedComposerLabel =
    stagedBacklogCommand?.label
    || stagedSlideCreationCommandLabel
    || stagedAdCreationCommandLabel
    || stagedResearchCreationCommandLabel
    || stagedScrapeCreationCommandLabel
    || stagedParseCreationCommandLabel
    || stagedSkillCreationCommandLabel
    || stagedAgentCreationCommandLabel
    || stagedResourceCreationCommandLabel
    || stagedThreadContextCommandLabel;
  const stagedComposerToneValue = stagedBacklogCommand || stagedResourceCreationCommand || stagedAgentCreationCommand || stagedSkillCreationCommand || stagedSlideCreationCommand || stagedResearchCreationCommand || stagedScrapeCreationCommand || stagedParseCreationCommand || stagedAdCreationCommand ? "compact" : stagedThreadContextCommandToneValue;
  const stagedComposerOffsetValue = stagedBacklogCommand || stagedResourceCreationCommand || stagedAgentCreationCommand || stagedSkillCreationCommand || stagedSlideCreationCommand || stagedResearchCreationCommand || stagedScrapeCreationCommand || stagedParseCreationCommand || stagedAdCreationCommand
    ? `${Math.max(
        16,
        Math.round(
          stagedComposerLabel.length * 7
          + 20
          + (stagedResourceCreationCommand?.action === "computer" ? 14 : 0)
        )
      )}px`
    : stagedThreadContextCommandOffset(stagedThreadContextCommand);
  const hasStagedComposerCommand = Boolean(stagedThreadContextCommand || stagedResourceCreationCommand || stagedAgentCreationCommand || stagedSkillCreationCommand || stagedSlideCreationCommand || stagedResearchCreationCommand || stagedScrapeCreationCommand || stagedParseCreationCommand || stagedAdCreationCommand || stagedBacklogCommand);
  const slashCommandInputState = useMemo(() => {
    if (hasStagedComposerCommand) {
      return null;
    }
    return resolveRunnerSlashCommandInputState(input, inputSelectionStart);
  }, [hasStagedComposerCommand, input, inputSelectionStart]);
  const availableSlashCommandItems = useMemo(() => {
    const items: Array<{
      id: string;
      command: string;
      description: string;
      icon: ReactNode;
      stage: () => void;
    }> = [];
    items.push({
      id: "slides",
      command: "/slides",
      description: "Create slides",
      icon: <LucidePresentation className="tb-popup-icon" strokeWidth={1.75} />,
      stage: () => stageSlideCreationCommand(slashCommandInputState?.prompt || ""),
    });
    items.push({
      id: "ad",
      command: "/ad",
      description: "Create ad",
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
        description: "Create agent",
        icon: <LucideBot className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageAgentCreationCommand("agent", slashCommandInputState?.prompt || ""),
      });
      items.push({
        id: "team",
        command: "/team",
        description: "Create team",
        icon: <LucideLayers className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageAgentCreationCommand("team", slashCommandInputState?.prompt || ""),
      });
    }
    if (enableResourceCreationCommand) {
      items.push({
        id: "computer",
        command: "/computer",
        description: "Create computer",
        icon: <LucideCpu className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageResourceCreationCommand("computer", slashCommandInputState?.prompt || ""),
      });
      items.push({
        id: "app",
        command: "/app",
        description: "Create app",
        icon: <LucideMonitor className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageResourceCreationCommand("app", slashCommandInputState?.prompt || ""),
      });
      items.push({
        id: "function",
        command: "/function",
        description: "Create function",
        icon: <LucideCode className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageResourceCreationCommand("function", slashCommandInputState?.prompt || ""),
      });
    }
    if (enableSkillCreationCommand) {
      items.push({
        id: "skill",
        command: "/skill",
        description: "Create skill",
        icon: <LucideWand2 className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageSkillCreationCommand("skill", slashCommandInputState?.prompt || ""),
      });
    }
    return items;
  }, [enableAgentCreationCommand, enableResourceCreationCommand, enableSkillCreationCommand, slashCommandInputState?.prompt]);
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
    setAdCreationSettings((current) => {
      const next = normalizeRunnerAdCreationSettings({ ...current, ...patch });
      setStagedAdCreationCommand((command) => command ? buildStagedRunnerAdCreationCommand(next) : command);
      return next;
    });
  }
  const hasApiKey = apiKey.trim().length > 0;
  const authenticatedAttachmentFetchHeaders = useMemo(
    () => buildRunnerHeaders(requestHeaders, apiKey.trim()),
    [apiKey, requestHeaders]
  );
  const canonicalThreadId = String(currentThreadId || "").trim();
  const canonicalThreadEnabled = Boolean(
    threadViewMode !== "legacy" && canonicalThreadId && normalizedBackendUrl && hasApiKey
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
  const hasLegacyOnlyThreadAffordances = useMemo(() => (
    Boolean(
      threadTaskPreview
      || threadMissionControlPreview
      || renderUserPromptContent
      || renderRunSummaryJsonSegment
      || followUpActions.length > 0
      || followUpError
    )
    || turns.some((turn) => (
      (turn.presentation === "btw" && turn.messageMetadata?.source !== "thread_v2_communicator")
      || (turn.presentation === "context-action-notice" && !isVoiceModeNoticeTurn(turn))
      || Boolean(turn.quotedSelection)
      || Boolean(turn.attachments?.length)
      || Boolean(turn.slideCreationCommand || turn.researchCreationCommand || turn.scrapeCreationCommand || turn.parseCreationCommand || turn.adCreationCommand)
      || isRunnerEmailMetadata(turn.messageMetadata)
      || turn.messageMetadata?.canonicalPersistenceFailed === true
    ))
  ), [
    followUpActions.length,
    followUpError,
    renderRunSummaryJsonSegment,
    renderUserPromptContent,
    threadMissionControlPreview,
    threadTaskPreview,
    turns,
  ]);
  const shouldUseCanonicalThreadSurface = canonicalThreadEnabled && canonicalProjectionMatchesThread && (
    threadViewMode === "canonical"
    || (threadViewMode === "auto" && hasCanonicalTimelineContent && !hasLegacyOnlyThreadAffordances)
  );
  const shouldUseLegacyVoiceTranscriptFallback = threadViewMode === "legacy"
    || (substantiveLegacyTurnCount > 0 && !shouldUseCanonicalThreadSurface);
  const activeCanonicalRun = canonicalProjectionMatchesThread
    ? Object.values(canonicalThread.projection.runsById)
      .filter((run) => ["queued", "pending", "running", "parked", "waiting", "waiting_permission", "requires_action"].includes(run.status))
      .sort((left, right) => (right.updatedAt || right.createdAt).localeCompare(left.updatedAt || left.createdAt))[0] || null
    : null;
  const hasRoutableActiveRun = hasRunningTurn || Boolean(activeCanonicalRun);
  const legacyCompatibilityEntries = useMemo(() => {
    if (!canonicalProjectionMatchesThread) return [];
    const canonicalMessageIds = new Set(Object.keys(canonicalThread.projection.messagesById));
    const canonicalUserMessages = Object.values(canonicalThread.projection.messagesById)
      .filter((message) => canonicalThread.projection.participantsById[message.authorParticipantId]?.kind === "human");
    const matchedMessageIds = new Set<string>();
    const compatibility: Array<{ turn: RunnerTurn; projection: RunnerThreadProjection }> = [];
    for (const turn of turns) {
      if (turn.presentation === "btw" || turn.presentation === "context-action-notice") continue;
      const workflowMetadata = turn.logs
        .map((log) => getRecordObject(log.metadata as Record<string, unknown> | null | undefined, ["metronomeWorkflow", "metronome_workflow"]))
        .find(Boolean) || getRecordObject(turn.messageMetadata, ["metronomeWorkflow", "metronome_workflow"]);
      const workflowRunId = getRecordString(workflowMetadata, ["runId", "run_id", "workflowRunId", "workflow_run_id"]);
      const workflowNodeId = getRecordString(workflowMetadata, ["nodeId", "node_id", "activeNodeId", "active_node_id"]);
      if (workflowRunId && Object.values(canonicalThread.projection.runsById).some((run) => (
        String(run.metadata?.workflowRunId || run.metadata?.runId || "") === workflowRunId
        && (!workflowNodeId || String(run.metadata?.workflowNodeId || run.metadata?.nodeId || "") === workflowNodeId)
      ))) continue;
      const prompt = turn.prompt.trim();
      if (!prompt) continue;
      const projection = legacyTurnProjectionsById.get(turn.id);
      if (!projection) continue;
      if (Object.keys(projection.runsById).some((runId) => Boolean(canonicalThread.projection.runsById[runId]))) continue;
      const exactSourceId = String(turn.sourceMessageId || "").trim();
      if (exactSourceId && canonicalMessageIds.has(exactSourceId)) {
        matchedMessageIds.add(exactSourceId);
        continue;
      }
      const matchedMessage = canonicalUserMessages.find((message) => {
        if (matchedMessageIds.has(message.id)) return false;
        if (exactSourceId && message.id === exactSourceId) return true;
        if (message.content.trim() !== prompt) return false;
        const messageTime = Date.parse(message.createdAt);
        return Number.isFinite(messageTime) && Math.abs(messageTime - turn.startedAtMs) <= 30_000;
      });
      if (matchedMessage) matchedMessageIds.add(matchedMessage.id);
      else compatibility.push({ turn, projection });
    }
    return compatibility;
  }, [
    canonicalProjectionMatchesThread,
    canonicalThread.projection.messagesById,
    canonicalThread.projection.participantsById,
    canonicalThread.projection.runsById,
    legacyTurnProjectionsById,
    turns,
  ]);
  const [legacyCompatibilityHistoryEntries, legacyCompatibilityTailEntries] = useMemo(() => {
    const canonicalAnchorTimes = canonicalThread.projection.timeline
      .filter((reference) => reference.kind === "message" || reference.kind === "run")
      .map((reference) => Date.parse(reference.createdAt))
      .filter(Number.isFinite);
    const earliestCanonicalTime = canonicalAnchorTimes.length > 0 ? Math.min(...canonicalAnchorTimes) : Number.POSITIVE_INFINITY;
    const history: typeof legacyCompatibilityEntries = [];
    const tail: typeof legacyCompatibilityEntries = [];
    for (const entry of legacyCompatibilityEntries) {
      if (
        entry.turn.status === "queued"
        || entry.turn.status === "running"
        || entry.turn.startedAtMs >= earliestCanonicalTime
      ) tail.push(entry);
      else history.push(entry);
    }
    return [history, tail];
  }, [canonicalThread.projection.timeline, legacyCompatibilityEntries]);
  const hasCanonicalSurfaceContent = canonicalThread.projection.timeline.length > 0 || legacyCompatibilityEntries.length > 0;
  useEffect(() => {
    let cancelled = false;
    const normalizedThreadId = String(currentThreadId || "").trim();
    if (!normalizedThreadId || !normalizedBackendUrl || !hasApiKey) {
      setThreadFeedbackState({
        userRating: null,
        upCount: 0,
        downCount: 0,
        reportCount: 0,
        isSubmitting: false,
      });
      return;
    }

    void fetchThreadFeedback({
      backendUrl: normalizedBackendUrl,
      apiKey: apiKey.trim(),
      threadId: normalizedThreadId,
      requestHeaders,
    })
      .then((feedback) => {
        if (cancelled) {
          return;
        }
        setThreadFeedbackState({ ...feedback, isSubmitting: false });
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setThreadFeedbackState((previous) => ({ ...previous, isSubmitting: false }));
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, currentThreadId, hasApiKey, normalizedBackendUrl, requestHeaders]);
  const summaryPreviewEnvironmentId = scopedActiveThreadEnvironmentId || selectedEnvironmentId || environmentId || null;
  const canPreviewSummaryWorkspacePaths = Boolean(summaryPreviewEnvironmentId);
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
  const selectedProject = useMemo(
    () => availableProjects.find((project) => project.id === selectedProjectId) || null,
    [availableProjects, selectedProjectId]
  );
  const selectedProjectEnvironmentId = getRunnerProjectEnvironmentId(selectedProject);
  const effectiveWorkspaceSelectorMode: RunnerWorkspaceSelectorMode =
    workspaceSelectorMode === "projects" && selectedProject && selectedProjectEnvironmentId
      ? "projects"
      : "computers";
  const effectiveProjectEnvironmentId =
    effectiveWorkspaceSelectorMode === "projects" ? selectedProjectEnvironmentId : "";
  const targetMainPopup = getMainPopupRenderId(activeInputPopup);
  const targetSidePopup = getSidePopupRenderId(activeInputPopup);
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
  const selectedReasoningEffortOption = getRunnerReasoningEffortOption(effectiveReasoningEffort);
  const isPassiveWarmEnvironmentReady = !useComputerAgentsMode || Boolean(effectiveEnvironmentId);
  const isPassiveWarmAgentReady = !useComputerAgentsMode || Boolean(effectiveAgentId);
  const textareaAllowsPromptAfterStagedCommand = threadContextActionAllowsPrompt(stagedThreadContextCommand);
  const hasCustomEmptyStateActive = turns.length === 0 && emptyState !== undefined && emptyState !== null;

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

  function isStopRequestedThread(threadIdToMatch?: string | null): boolean {
    const requestedThreadId = String(stopRequestedThreadIdRef.current || "").trim();
    const normalizedThreadId = String(threadIdToMatch || "").trim();
    return Boolean(requestedThreadId && normalizedThreadId && requestedThreadId === normalizedThreadId);
  }

  function isIntentionalStopError(error: Error, threadIdToMatch?: string | null): boolean {
    if (!isStopRequestedThread(threadIdToMatch)) {
      return false;
    }
    if (error.name === "AbortError") {
      return true;
    }
    const message = String(error?.message || "").trim();
    if (!message) {
      return false;
    }
    return (
      /runner stream failed \((?:499|500|502|503|504)\)/i.test(message)
      || /<title>\s*502 Server Error\s*<\/title>/i.test(message)
      || /temporary error and could not complete your request/i.test(message)
      || /the server encountered a temporary error/i.test(message)
      || /failed to fetch/i.test(message)
    );
  }

  function normalizeIntentionalStopError(error: Error, threadIdToMatch?: string | null): Error {
    if (!isIntentionalStopError(error, threadIdToMatch)) {
      return error;
    }
    if (error.name === "AbortError") {
      return error;
    }
    const abortError = new Error("Execution cancelled");
    abortError.name = "AbortError";
    return abortError;
  }

  function consumeIntentionalStopAbort(error: Error, threadIdToMatch?: string | null): boolean {
    if (!isIntentionalStopError(error, threadIdToMatch)) {
      return false;
    }
    stopRequestedThreadIdRef.current = null;
    return true;
  }

  function markRunningTurnsCancelled() {
    const cancelledAtMs = Date.now();
    setTurns((previousTurns) =>
      previousTurns.map((turn) =>
        (isRunningTurnStatus(turn.status) || turn.status === "queued")
          ? {
              ...turn,
              status: "cancelled",
              completedAtMs: cancelledAtMs,
              durationSeconds:
                typeof turn.durationSeconds === "number" && Number.isFinite(turn.durationSeconds)
                  ? Math.max(0, Math.round(turn.durationSeconds))
                  : Math.max(0, Math.floor((cancelledAtMs - turn.startedAtMs) / 1000)),
            }
          : turn
      )
    );
  }

  async function handleStopActiveRun() {
    if (isStoppingRun) {
      return;
    }

    const threadIdToCancel = String(currentThreadId || "").trim();
    const hasLocalExecution = isRunning;

    if (!threadIdToCancel && !hasLocalExecution) {
      return;
    }

    setInlineError(null);
    setIsPreparingRun(false);
    setPendingQueuedMessages([]);
    setIsStoppingRun(true);

    if (threadIdToCancel) {
      stopRequestedThreadIdRef.current = threadIdToCancel;
    }

    try {
      if (threadIdToCancel && normalizedBackendUrl && hasApiKey) {
        await cancelThreadExecution({
          backendUrl: normalizedBackendUrl,
          apiKey: apiKey.trim(),
          threadId: threadIdToCancel,
          requestHeaders,
        });
      }

      markRunningTurnsCancelled();
      cancel();

      if (!hasLocalExecution) {
        stopRequestedThreadIdRef.current = null;
      }

      if (threadIdToCancel) {
        refreshThreadContextDetailsInBackground(threadIdToCancel);
        try {
          onRunCancel?.(threadIdToCancel);
        } catch (callbackError) {
          reportRunnerLifecycleCallbackError("onRunCancel", callbackError);
        }
      }
    } catch (error) {
      stopRequestedThreadIdRef.current = null;
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setInlineError(normalizedError.message || "Failed to stop agent.");
      try {
        onRunError?.(normalizedError, threadIdToCancel || undefined);
      } catch (callbackError) {
        reportRunnerLifecycleCallbackError("onRunError", callbackError);
      }
    } finally {
      setIsStoppingRun(false);
    }
  }

  function applyHydratedThreadEnvironment(payload: RunnerThreadHydrationPayload) {
    const nextEnvironmentId = payload.threadEnvironmentId ?? null;
    const nextEnvironmentName = payload.threadEnvironmentName ?? payload.environmentName ?? null;
    setActiveThreadEnvironmentId(nextEnvironmentId);
    setActiveThreadEnvironmentName(nextEnvironmentName);
    if (nextEnvironmentId) {
      setSelectedEnvironmentId(nextEnvironmentId);
    }
  }

  function buildSuggestedForkEnvironmentName() {
    const baseName = sourceThreadEnvironmentName || selectedEnvironment?.name || displayedEnvironmentLabel || "Environment";
    return `${baseName} Fork`;
  }

  function resetForkConfiguration() {
    setPendingForkConfiguration(null);
    setForkTarget("existing_environment");
    setForkTargetEnvironmentId(sourceThreadEnvironmentId || selectedEnvironmentId || environmentId || "");
    setForkNewEnvironmentName(buildSuggestedForkEnvironmentName());
    setForkNewEnvironmentFileCopyMode("all");
    setForkExistingEnvironmentFileCopyMode("none");
    setShowForkEnvironmentPopup(false);
    setForkDialogError(null);
  }

  async function fetchThreadContextEstimate(nextThreadId: string): Promise<RunnerChatThreadContext | null> {
    return fetchRunnerThreadContext({
      backendUrl: normalizedBackendUrl,
      apiKey,
      requestHeaders,
      threadId: nextThreadId,
    });
  }

  async function fetchThreadContextDetails(nextThreadId: string): Promise<{
    context: RunnerChatThreadContextDetails | null;
    availableActions: RunnerChatThreadContextAvailableActions;
    nativeError: string | null;
  }> {
    return fetchRunnerThreadContextDetails({
      backendUrl: normalizedBackendUrl,
      apiKey,
      requestHeaders,
      threadId: nextThreadId,
    });
  }

  function appendSyntheticActionTurn(
    promptText: string,
    responseText: string,
    detailLabel: string,
    options?: {
      presentation?: RunnerTurn["presentation"];
      messageMetadata?: Record<string, unknown> | null;
    }
  ) {
    const turnId = generateId("turn");
    const now = Date.now();
    const timestamp = new Date(now).toISOString();
    setTurns((prev) => [
      ...prev,
      {
        id: turnId,
        prompt: promptText,
        messageMetadata: options?.messageMetadata || null,
        logs: [
          {
            time: timestamp,
            message: detailLabel,
            type: "info",
            eventType: "setup",
          },
          {
            time: timestamp,
            message: responseText,
            type: "success",
            eventType: "agent_message",
          },
        ],
        startedAtMs: now,
        completedAtMs: now,
        durationSeconds: 0,
        status: "completed",
        animateOnRender: true,
        isInitialTurn: prev.length === 0,
        agentName: selectedAgent?.name || displayedAgentLabel,
        environmentName: selectedEnvironment?.name || displayedEnvironmentLabel,
        presentation: options?.presentation || "default",
      },
    ]);
    setExpandedTurns((prev) => ({ ...prev, [turnId]: true }));
  }

  async function tryHandleThreadCommunicatorMessage(content: string): Promise<boolean> {
    const normalizedContent = content.trim();
    const resolvedThreadId = String(currentThreadId || "").trim();
    if (!normalizedContent || !resolvedThreadId || !normalizedBackendUrl || !hasApiKey) return false;

    const deterministicControl = normalizedContent.match(
      /^(stop|pause|cancel|resume|park)(?:\s+(?:(?:this|the current|the|current)\s+)?(?:run|task|worker|job|deployment|deploy))?(?:\s+now)?[.!]?$/i,
    )?.[1]?.toLowerCase() || null;
    if (deterministicControl) {
      if (deterministicControl === "stop" || deterministicControl === "cancel") {
        if (!hasRoutableActiveRun) {
          setInlineError("There is no active run to stop.");
          return true;
        }
        await handleStopActiveRun();
        return true;
      }
      if (!activeCanonicalRun) {
        setInlineError(`The current runtime cannot ${deterministicControl} at a safe checkpoint yet. The command was not sent as a worker task.`);
        return true;
      }
      try {
        const command = await canonicalThread.controlRun(activeCanonicalRun.id, {
          action: deterministicControl as "pause" | "resume" | "park",
          reason: "Explicit deterministic control from the thread composer.",
          idempotencyKey: `runner-chat-control:${resolvedThreadId}:${activeCanonicalRun.id}:${deterministicControl}:${Date.now()}`,
        });
        if (command.effectApplied === false) {
          setInlineError(command.limitation || "The control request was recorded and is waiting for the run coordinator.");
        }
      } catch (error) {
        setInlineError(error instanceof Error ? error.message : String(error));
      }
      return true;
    }

    const fallbackLooksLikeStatusQuestion = /(^|\s)@communicator\b/i.test(normalizedContent) || (
      /\b(status|progress|summary|update|happening|doing|working on|where are we|how(?:'s| is) it going|still running|what changed|why did)\b/i.test(normalizedContent)
      && (normalizedContent.includes("?") || /^(what|where|why|how|is|are|can you tell|give me)/i.test(normalizedContent))
    ) || (
      normalizedContent.includes("?")
      && /\b(tests?|files?|changes?|decisions?|assumptions?|errors?|build|branch|deploy(?:ment)?|worker|run)\b/i.test(normalizedContent)
      && /^(did|does|has|have|which|what|when|where|why|how|is|are|can|could|would)/i.test(normalizedContent)
    );
    const fallbackLooksLikeWorkerInstruction = /^(?:please\s+|can you\s+|could you\s+|would you\s+)?(?:add|analy[sz]e|build|change|configure|continue|copy|create|debug|deploy|design|document|edit|execute|find|fix|implement|improve|inspect|install|integrate|investigate|make|migrate|move|optimi[sz]e|publish|refactor|remove|rename|review|revert|retry|run|search|set\s+up|ship|test|update|upgrade|use|write)\b/i.test(normalizedContent)
      || /^(?:do not|don't|instead|also)\b/i.test(normalizedContent);

    try {
      const headers = buildRunnerVoiceHeaders(requestHeaders, apiKey);
      let shouldUseCommunicator = fallbackLooksLikeStatusQuestion
        || (hasRoutableActiveRun && !fallbackLooksLikeWorkerInstruction);
      let targetRunId = activeCanonicalRun?.id || null;
      let controlAction: string | null = null;
      try {
        const classificationResponse = await fetch(
          `${normalizedBackendUrl}/threads/${encodeURIComponent(resolvedThreadId)}/activity/classify`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              content: normalizedContent,
            }),
          },
        );
        if (classificationResponse.ok) {
          const classification = await classificationResponse.json() as Record<string, unknown>;
          const decision = classification.decision && typeof classification.decision === "object"
            ? classification.decision as Record<string, unknown>
            : {};
          const rawRoute = String(decision.route || "").trim().toLowerCase();
          shouldUseCommunicator = classification.suggestedTransport === "activity_message" && rawRoute === "communicator";
          const explicitlyAddressedCommunicator = /(^|\s)@communicator\b/i.test(normalizedContent);
          const targetRunActive = classification.targetRunActive === true;
          // The shipped responder is grounded in thread state, not a general
          // conversational model. On an idle thread, preserve normal worker
          // execution unless the user clearly asks about the thread or names
          // the communicator. Ambiguous-to-communicator remains safe while a
          // worker is active.
          if (shouldUseCommunicator && !targetRunActive && !hasRoutableActiveRun && !fallbackLooksLikeStatusQuestion && !explicitlyAddressedCommunicator) {
            return false;
          }
          targetRunId = typeof classification.targetRunId === "string" ? classification.targetRunId : targetRunId;
          controlAction = typeof decision.controlAction === "string" ? decision.controlAction : null;
          if (rawRoute === "control") {
            if (controlAction === "stop" || controlAction === "cancel") {
              await handleStopActiveRun();
              return true;
            }
            if (targetRunId && ["pause", "resume", "park"].includes(controlAction || "")) {
              const command = await canonicalThread.controlRun(targetRunId, {
                action: controlAction as "pause" | "resume" | "park",
                reason: "Explicit control message from the thread composer.",
                idempotencyKey: `runner-chat-control:${resolvedThreadId}:${targetRunId}:${controlAction}:${Date.now()}`,
              });
              if (command.effectApplied === false) {
                setInlineError(command.limitation || "The control request was recorded and is waiting for the run coordinator.");
              }
              return true;
            }
            setInlineError(controlAction
              ? `There is no controllable run to ${controlAction}. The command was not sent as a worker task.`
              : "The message was classified as run control, but no supported control action was found. It was not sent as a worker task.");
            return true;
          }
          if (!shouldUseCommunicator) return false;
        }
      } catch {
        // Older backends do not expose the non-persisting classifier. The
        // conservative local status-question fallback preserves compatibility.
      }
      if (!shouldUseCommunicator) return false;

      const clientMessageId = generateId("activity-message");
      let routed: RunnerThreadRoutedMessageResult;
      try {
        routed = await canonicalThread.postMessage({
          clientMessageId,
          content: normalizedContent,
          intendedRoute: "communicator",
          deliveryMode: "fyi",
          metadata: { source: "runner_chat_communicator_preflight" },
        });
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        setInlineError(`${normalizedError.message || "Could not confirm the communicator response."} The message was not rerouted to the worker.`);
        setInput(normalizedContent);
        currentInputRef.current = normalizedContent;
        focusComposerSoon({ preventScroll: true });
        return true;
      }
      const responseText = routed.communicator?.message.content.trim() || "";
      if (!responseText) {
        setInlineError("The communicator accepted the message but did not return a response. It was not rerouted to the worker.");
        setInput(normalizedContent);
        currentInputRef.current = normalizedContent;
        focusComposerSoon({ preventScroll: true });
        return true;
      }
      if (!shouldUseCanonicalThreadSurface) {
        appendSyntheticActionTurn(normalizedContent, responseText, "Communicator answered", {
          presentation: "btw",
          messageMetadata: {
            source: "thread_v2_communicator",
            routingReceiptLabel: "Answered by Communicator",
            routingReceiptStatus: String(routed.routingReceipt?.status || "answered"),
            routingReceiptId: String(routed.routingReceipt?.id || ""),
          },
        });
      }
      return true;
    } catch {
      // The legacy queue remains the safe fallback while Thread v2 rolls out.
      return false;
    }
  }

  async function tryHandleActiveCanonicalWorkerInstruction(content: string): Promise<boolean> {
    const normalizedContent = content.trim();
    const run = activeCanonicalRun;
    if (
      !normalizedContent
      || !run
      || !canonicalThreadEnabled
      || !canonicalProjectionMatchesThread
    ) {
      return false;
    }

    const clientMessageId = generateId("worker-instruction");
    try {
      const instruction = await persistRunnerActiveRunInstruction({
        clientMessageId,
        content: normalizedContent,
        postMessage: canonicalThread.postMessage,
        runId: run.id,
      });
      const notice = getRunnerActiveRunInstructionNotice(instruction);
      if (notice) setInlineError(notice);
      return true;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setInlineError(
        `${normalizedError.message || "Worker delivery could not be confirmed."} `
        + "The message remains in the composer and was not placed in the page-local queue.",
      );
      setInput(normalizedContent);
      currentInputRef.current = normalizedContent;
      focusComposerSoon({ preventScroll: true });
      return true;
    }
  }


  function appendThreadContextActionNotice(action: RunnerChatThreadContextAction, message: string) {
    const turnId = generateId("turn");
    const now = Date.now();
    const timestamp = new Date(now).toISOString();
    setTurns((prev) => [
      ...prev,
      {
        id: turnId,
        prompt: "",
        logs: [
          {
            time: timestamp,
            message,
            type: "info",
            eventType: "action_summary",
            metadata: {
              actionType: action,
            },
          },
        ],
        startedAtMs: now,
        completedAtMs: now,
        durationSeconds: 0,
        status: "completed",
        animateOnRender: true,
        isInitialTurn: prev.length === 0,
        agentName: selectedAgent?.name || displayedAgentLabel,
        environmentName: selectedEnvironment?.name || displayedEnvironmentLabel,
        presentation: "context-action-notice",
      },
    ]);
    return turnId;
  }

  function appendPendingThreadContextActionNotice(
    action: RunnerChatThreadContextAction,
    message: string,
    options?: { prompt?: string }
  ) {
    const turnId = generateId("turn");
    const now = Date.now();
    const timestamp = new Date(now).toISOString();
    setTurns((prev) => [
      ...prev,
      {
        id: turnId,
        prompt: options?.prompt || "",
        logs: [
          {
            time: timestamp,
            message,
            type: "info",
            eventType: "action_summary",
            metadata: {
              actionType: action,
              isPending: true,
            },
          },
        ],
        startedAtMs: now,
        status: "running",
        animateOnRender: true,
        isInitialTurn: prev.length === 0,
        agentName: selectedAgent?.name || displayedAgentLabel,
        environmentName: selectedEnvironment?.name || displayedEnvironmentLabel,
        presentation: "context-action-notice",
      },
    ]);
    return turnId;
  }

  function updateThreadContextActionNotice(
    turnId: string,
    message: string,
    options?: { pending?: boolean; failed?: boolean }
  ) {
    const now = Date.now();
    const timestamp = new Date(now).toISOString();
    setTurns((prev) =>
      prev.map((turn) => {
        if (turn.id !== turnId) {
          return turn;
        }
        const nextLogs = turn.logs.map((log, index) =>
          index === 0 && log.eventType === "action_summary"
            ? {
                ...log,
                time: timestamp,
                message,
                type: (options?.failed ? "error" : "info") as RunnerLog["type"],
                metadata: {
                  ...log.metadata,
                  isPending: options?.pending ?? false,
                  failed: options?.failed ?? false,
                },
              }
            : log
        );
        return {
          ...turn,
          logs: nextLogs,
          status: options?.failed ? "failed" : options?.pending ? "running" : "completed",
          completedAtMs: options?.pending ? undefined : now,
          durationSeconds: options?.pending ? undefined : getTurnDurationSeconds(turn),
        };
      })
    );
  }

  async function refreshThreadContextDetails(nextThreadId?: string) {
    const resolvedThreadId = nextThreadId || currentThreadId;
    if (!resolvedThreadId || !hasApiKey || !normalizedBackendUrl) {
      setThreadContextDetails(null);
      setThreadContextDetailsError(null);
      setThreadContextNativeError(null);
      setThreadContextAvailableActions(DEFAULT_THREAD_CONTEXT_ACTIONS);
      return;
    }

    setIsThreadContextDetailsLoading(true);
    setThreadContextDetailsError(null);
    try {
      const details = await fetchThreadContextDetails(resolvedThreadId);
      setThreadContextDetails(details.context);
      setThreadContext(details.context);
      setThreadContextAvailableActions(details.availableActions);
      setThreadContextNativeError(details.nativeError);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setThreadContextDetails(null);
      setThreadContextDetailsError(normalizedError.message || "Failed to load thread context details.");
      setThreadContextNativeError(null);
      setThreadContextAvailableActions(DEFAULT_THREAD_CONTEXT_ACTIONS);
    } finally {
      setIsThreadContextDetailsLoading(false);
    }
  }

  function refreshThreadContextDetailsInBackground(nextThreadId?: string) {
    void refreshThreadContextDetails(nextThreadId).catch(() => undefined);
  }

  async function refreshDeepResearchSessions(nextThreadId?: string): Promise<void> {
    const resolvedThreadId = String(nextThreadId || currentThreadId || "").trim();
    if (!resolvedThreadId || !hasApiKey || !normalizedBackendUrl) {
      setDeepResearchSessions([]);
      return;
    }
    try {
      const sessions = await fetchThreadResearchSessions({
        backendUrl: normalizedBackendUrl,
        apiKey: apiKey.trim(),
        threadId: resolvedThreadId,
        requestHeaders,
      });
      setDeepResearchSessions(sessions);
    } catch {
      // Keep the last known sessions during transient polling failures.
    }
  }

  function handleContextIndicatorClick() {
    onContextIndicatorClick?.(threadContext);
    togglePopup("context");
  }

  function openContextPopup() {
    onContextIndicatorClick?.(threadContext);
    setActiveInputPopup("context");
  }

  function clearComposerDraft(options?: { preserveStagedCommand?: boolean; preserveQuotedSelection?: boolean }) {
    setInput("");
    if (!options?.preserveStagedCommand) {
      setStagedThreadContextCommand(null);
      setStagedResourceCreationCommand(null);
      setStagedAgentCreationCommand(null);
      setStagedSkillCreationCommand(null);
      setStagedSlideCreationCommand(null);
      setStagedResearchCreationCommand(null);
      setStagedScrapeCreationCommand(null);
      setStagedParseCreationCommand(null);
      setStagedAdCreationCommand(null);
      setStagedBacklogSubtaskCommand(null);
      setStagedBacklogMissionControlCommand(null);
    }
    if (!options?.preserveQuotedSelection) {
      setComposerQuotedSelection(null);
    }
    currentInputRef.current = "";
    resetSpeechDraft("");
  }

  function clearQuotedSelectionPopup() {
    setQuotedSelectionPopup(null);
  }

  function clearComposerQuotedSelection() {
    setComposerQuotedSelection(null);
  }

  function closeDocumentAttachmentPreview() {
    setPreviewedDocumentAttachment(null);
    setPreviewImageSelectionState(null);
    setIsDocumentPreviewMaximized(false);
    setDocumentPreviewActionMenuOpen(false);
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

  function startDocumentPreviewResize(event: ReactPointerEvent<HTMLButtonElement>) {
    if (typeof window === "undefined") {
      return;
    }
    const drawerWidth = event.currentTarget.parentElement?.getBoundingClientRect().width;
    if (!drawerWidth) {
      return;
    }
    documentPreviewResizeStateRef.current = {
      startX: event.clientX,
      startWidth: drawerWidth,
    };
    event.preventDefault();
  }

  function toggleDocumentAttachmentPreview(attachment: RunnerTurnAttachment) {
    if (!isAttachmentDocumentPreviewable(attachment)) {
      return;
    }
    closeDeepResearchDetailDrawer();
    closeSubagentDetailDrawer();
    closeComputerUseDetailDrawer();
    setDocumentPreviewActionMenuOpen(false);
    setPreviewedDocumentAttachment((current) => {
      if (current?.id === attachment.id) {
        setIsDocumentPreviewMaximized(false);
        return null;
      }
      setIsDocumentPreviewMaximized(false);
      return attachment;
    });
  }

  function toggleDocumentPreviewMaximized() {
    setDocumentPreviewActionMenuOpen(false);
    setIsDocumentPreviewMaximized((current) => !current);
  }

  function getDocumentPreviewOpenUrl(attachment: RunnerTurnAttachment | null): string {
    if (!attachment) {
      return "";
    }
    const baseFileUrl = attachment.previewUrl || attachment.url || "";
    const htmlPreviewUrl =
      typeof attachment.htmlPreviewUrl === "string" && attachment.htmlPreviewUrl.trim()
        ? attachment.htmlPreviewUrl
        : isRunnerPreviewHtmlFile(attachment.filename, attachment.mimeType)
          ? buildRunnerPreviewHtmlPreviewUrlFromDownloadUrl(baseFileUrl, attachment.filename, attachment.mimeType)
          : "";
    return (
      resolveRunnerPreviewAssetUrl(htmlPreviewUrl || baseFileUrl, normalizedBackendUrl, attachment.id) ||
      resolveRunnerPreviewAssetUrl(baseFileUrl, normalizedBackendUrl, attachment.id) ||
      ""
    );
  }

  function copyDocumentPreviewValue(value: string) {
    if (!value.trim() || typeof navigator === "undefined") {
      return;
    }
    void navigator.clipboard?.writeText(value);
    setDocumentPreviewActionMenuOpen(false);
  }

  function revokeAttachmentPreview(attachment: Pick<LocalAttachment, "previewUrl">) {
    if (attachment.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
  }

  function pruneWorkspaceAttachmentsForEnvironment(nextEnvironmentId: string) {
    setAttachments((prev) => {
      const removed: LocalAttachment[] = [];
      const kept = prev.filter((attachment) => {
        const shouldRemove =
          attachment.source === "workspace" &&
          Boolean(attachment.sourceEnvironmentId) &&
          attachment.sourceEnvironmentId !== nextEnvironmentId;
        if (shouldRemove) {
          removed.push(attachment);
        }
        return !shouldRemove;
      });
      for (const attachment of removed) {
        revokeAttachmentPreview(attachment);
      }
      return removed.length > 0 ? kept : prev;
    });
  }

  function clearComposerAttachments(entries?: LocalAttachment[], options?: { revokePreviews?: boolean }) {
    const attachmentsToClear = entries || attachments;
    if (options?.revokePreviews !== false) {
      for (const attachment of attachmentsToClear) {
        revokeAttachmentPreview(attachment);
      }
    }
    setAttachments([]);
  }

  function setComposerDraft(prompt: string) {
    setStagedThreadContextCommand(null);
    setStagedResourceCreationCommand(null);
    setStagedAgentCreationCommand(null);
    setStagedSkillCreationCommand(null);
    setStagedSlideCreationCommand(null);
    setStagedResearchCreationCommand(null);
    setStagedScrapeCreationCommand(null);
    setStagedParseCreationCommand(null);
    setStagedAdCreationCommand(null);
    setInput(prompt);
    currentInputRef.current = prompt;
    resetSpeechDraft(prompt);
  }

  function stageThreadContextCommand(action: RunnerChatThreadContextAction, prompt = "") {
    setStagedResourceCreationCommand(null);
    setStagedAgentCreationCommand(null);
    setStagedSkillCreationCommand(null);
    setStagedSlideCreationCommand(null);
    setStagedResearchCreationCommand(null);
    setStagedScrapeCreationCommand(null);
    setStagedParseCreationCommand(null);
    setStagedAdCreationCommand(null);
    setStagedBacklogSubtaskCommand(null);
    setStagedBacklogMissionControlCommand(null);
    setStagedThreadContextCommand(action);
    setInput(prompt);
    currentInputRef.current = prompt;
    resetSpeechDraft(prompt);
  }

  function stageBacklogSubtaskCommand(ticketNumber: string, prompt?: string) {
    const normalizedTicketNumber = normalizeRunnerBacklogTicketNumber(ticketNumber);
    if (!normalizedTicketNumber) {
      return;
    }
    const nextPrompt = prompt === undefined ? currentInputRef.current : prompt;
    setStagedThreadContextCommand(null);
    setStagedResourceCreationCommand(null);
    setStagedAgentCreationCommand(null);
    setStagedSkillCreationCommand(null);
    setStagedSlideCreationCommand(null);
    setStagedResearchCreationCommand(null);
    setStagedScrapeCreationCommand(null);
    setStagedParseCreationCommand(null);
    setStagedAdCreationCommand(null);
    setStagedBacklogMissionControlCommand(null);
    setStagedBacklogSubtaskCommand({
      action: "subtask",
      ticketNumber: normalizedTicketNumber,
      label: buildRunnerBacklogSubtaskLabel(normalizedTicketNumber),
    });
    setInput(nextPrompt);
    currentInputRef.current = nextPrompt;
    resetSpeechDraft(nextPrompt);
  }

  function stageBacklogMissionControlCommand(prompt = "") {
    setStagedThreadContextCommand(null);
    setStagedResourceCreationCommand(null);
    setStagedAgentCreationCommand(null);
    setStagedSkillCreationCommand(null);
    setStagedSlideCreationCommand(null);
    setStagedResearchCreationCommand(null);
    setStagedScrapeCreationCommand(null);
    setStagedParseCreationCommand(null);
    setStagedAdCreationCommand(null);
    setStagedBacklogSubtaskCommand(null);
    setStagedBacklogMissionControlCommand({
      action: "mission_control",
      label: buildRunnerMissionControlLabel(),
    });
    setInput(prompt);
    currentInputRef.current = prompt;
    resetSpeechDraft(prompt);
  }

  function stageResourceCreationCommand(action: RunnerResourceCreationCommandType, prompt = "") {
    setStagedThreadContextCommand(null);
    setStagedAgentCreationCommand(null);
    setStagedSkillCreationCommand(null);
    setStagedSlideCreationCommand(null);
    setStagedResearchCreationCommand(null);
    setStagedScrapeCreationCommand(null);
    setStagedParseCreationCommand(null);
    setStagedAdCreationCommand(null);
    setStagedBacklogSubtaskCommand(null);
    setStagedBacklogMissionControlCommand(null);
    setStagedResourceCreationCommand({
      action,
      label: buildRunnerResourceCreationLabel(action),
    });
    setInput(prompt);
    currentInputRef.current = prompt;
    resetSpeechDraft(prompt);
  }

  function stageAgentCreationCommand(action: RunnerAgentCreationCommandType, prompt = "") {
    setStagedThreadContextCommand(null);
    setStagedResourceCreationCommand(null);
    setStagedSkillCreationCommand(null);
    setStagedSlideCreationCommand(null);
    setStagedResearchCreationCommand(null);
    setStagedScrapeCreationCommand(null);
    setStagedParseCreationCommand(null);
    setStagedAdCreationCommand(null);
    setStagedBacklogSubtaskCommand(null);
    setStagedBacklogMissionControlCommand(null);
    setStagedAgentCreationCommand({
      action,
      label: buildRunnerAgentCreationLabel(action),
    });
    setInput(prompt);
    currentInputRef.current = prompt;
    resetSpeechDraft(prompt);
  }

  function stageSkillCreationCommand(action: RunnerSkillCreationCommandType, prompt = "") {
    setStagedThreadContextCommand(null);
    setStagedResourceCreationCommand(null);
    setStagedAgentCreationCommand(null);
    setStagedSlideCreationCommand(null);
    setStagedResearchCreationCommand(null);
    setStagedScrapeCreationCommand(null);
    setStagedParseCreationCommand(null);
    setStagedAdCreationCommand(null);
    setStagedBacklogSubtaskCommand(null);
    setStagedBacklogMissionControlCommand(null);
    setStagedSkillCreationCommand({
      action,
      label: buildRunnerSkillCreationLabel(action),
    });
    setInput(prompt);
    currentInputRef.current = prompt;
    resetSpeechDraft(prompt);
  }

  function stageSlideCreationCommand(prompt = "") {
    setStagedThreadContextCommand(null);
    setStagedResourceCreationCommand(null);
    setStagedAgentCreationCommand(null);
    setStagedSkillCreationCommand(null);
    setStagedResearchCreationCommand(null);
    setStagedScrapeCreationCommand(null);
    setStagedParseCreationCommand(null);
    setStagedAdCreationCommand(null);
    setStagedBacklogSubtaskCommand(null);
    setStagedBacklogMissionControlCommand(null);
    setStagedSlideCreationCommand({
      action: "slides",
      label: buildRunnerSlideCreationLabel(),
    });
    setInput(prompt);
    currentInputRef.current = prompt;
    resetSpeechDraft(prompt);
  }

  function stageResearchCreationCommand(prompt = "") {
    setStagedThreadContextCommand(null);
    setStagedResourceCreationCommand(null);
    setStagedAgentCreationCommand(null);
    setStagedSkillCreationCommand(null);
    setStagedSlideCreationCommand(null);
    setStagedAdCreationCommand(null);
    setStagedScrapeCreationCommand(null);
    setStagedParseCreationCommand(null);
    setStagedBacklogSubtaskCommand(null);
    setStagedBacklogMissionControlCommand(null);
    setStagedResearchCreationCommand({
      action: "research",
      label: buildRunnerResearchCreationLabel(),
    });
    setInput(prompt);
    currentInputRef.current = prompt;
    resetSpeechDraft(prompt);
  }

  function stageScrapeCreationCommand(prompt = "") {
    setStagedThreadContextCommand(null);
    setStagedResourceCreationCommand(null);
    setStagedAgentCreationCommand(null);
    setStagedSkillCreationCommand(null);
    setStagedSlideCreationCommand(null);
    setStagedResearchCreationCommand(null);
    setStagedAdCreationCommand(null);
    setStagedParseCreationCommand(null);
    setStagedBacklogSubtaskCommand(null);
    setStagedBacklogMissionControlCommand(null);
    setStagedScrapeCreationCommand({
      action: "scrape",
      label: buildRunnerScrapeCreationLabel(),
    });
    setInput(prompt);
    currentInputRef.current = prompt;
    resetSpeechDraft(prompt);
  }

  function stageParseCreationCommand(prompt = "") {
    setStagedThreadContextCommand(null);
    setStagedResourceCreationCommand(null);
    setStagedAgentCreationCommand(null);
    setStagedSkillCreationCommand(null);
    setStagedSlideCreationCommand(null);
    setStagedResearchCreationCommand(null);
    setStagedScrapeCreationCommand(null);
    setStagedAdCreationCommand(null);
    setStagedBacklogSubtaskCommand(null);
    setStagedBacklogMissionControlCommand(null);
    setStagedParseCreationCommand({
      action: "parse",
      label: buildRunnerParseCreationLabel(),
    });
    setInput(prompt);
    currentInputRef.current = prompt;
    resetSpeechDraft(prompt);
  }

  function stageAdCreationCommand(prompt = "") {
    setStagedThreadContextCommand(null);
    setStagedResourceCreationCommand(null);
    setStagedAgentCreationCommand(null);
    setStagedSkillCreationCommand(null);
    setStagedSlideCreationCommand(null);
    setStagedResearchCreationCommand(null);
    setStagedScrapeCreationCommand(null);
    setStagedParseCreationCommand(null);
    setStagedBacklogSubtaskCommand(null);
    setStagedBacklogMissionControlCommand(null);
    setStagedAdCreationCommand(buildStagedRunnerAdCreationCommand(adCreationSettings));
    setInput(prompt);
    currentInputRef.current = prompt;
    resetSpeechDraft(prompt);
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

  function collapseAllWorkingLogs(extraTurnId?: string, options?: { preserveExpandedTurnId?: string }) {
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
        if (turnId === options?.preserveExpandedTurnId && previousExpandedTurns[turnId] === true) {
          return;
        }
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
        if (turnId === options?.preserveExpandedTurnId) {
          return;
        }
        if (turnId in nextCounts) {
          delete nextCounts[turnId];
          didChange = true;
        }
      });
      return didChange ? nextCounts : previousCounts;
    });
  }

  function toggleWorkingLogs(turnId: string, isExpanded: boolean) {
    setExpandedTurns((prev) => ({ ...prev, [turnId]: !isExpanded }));
    setVisibleWorkLogItemCountsByTurn((previousCounts) => {
      if (!(turnId in previousCounts)) {
        return previousCounts;
      }
      const nextCounts = { ...previousCounts };
      delete nextCounts[turnId];
      return nextCounts;
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
      collapseAllWorkingLogs(turnId, { preserveExpandedTurnId: turnId });
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
      collapseAllWorkingLogs(turnId, { preserveExpandedTurnId: turnId });
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

  async function resolveEditableTurnBoundary(turnId: string): Promise<{ messageId: string; truncateAtMessageIndex: number }> {
    const targetTurn = turnsRef.current.find((turn) => turn.id === turnId);
    if (!targetTurn) {
      throw new Error("Message not found.");
    }

    const fallbackMessageId =
      typeof targetTurn.sourceMessageId === "string" && targetTurn.sourceMessageId.trim().startsWith("msg_")
        ? targetTurn.sourceMessageId.trim()
        : turnId.startsWith("msg_")
          ? turnId
          : "";

    if (!currentThreadId || !hasApiKey) {
      if (fallbackMessageId) {
        return {
          messageId: fallbackMessageId,
          truncateAtMessageIndex: 0,
        };
      }
      throw new Error("Message not found.");
    }

    const messages = await fetchAllThreadMessages({
      backendUrl: normalizedBackendUrl,
      apiKey: apiKey.trim(),
      threadId: currentThreadId,
      requestHeaders,
    });

    const canonicalUserMessages = messages.filter(
      (message) =>
        message.role === "user" &&
        typeof message.id === "string" &&
        message.id.trim().startsWith("msg_") &&
        typeof message.content === "string" &&
        !isBtwTurnPrompt(message.content) &&
        !isThreadContextCommandPrompt(message.content)
    );

    if (fallbackMessageId && canonicalUserMessages.some((message) => message.id === fallbackMessageId)) {
      const matchedIndex = messages.findIndex((message) => message.id === fallbackMessageId);
      return {
        messageId: fallbackMessageId,
        truncateAtMessageIndex: matchedIndex === -1 ? 0 : matchedIndex,
      };
    }

    const editableConversationTurns = turnsRef.current.filter(
      (turn) =>
        turn.presentation !== "btw" &&
        turn.presentation !== "context-action-notice" &&
        turn.prompt.trim().length > 0
    );
    const editableTurnIndex = editableConversationTurns.findIndex((turn) => turn.id === turnId);
    if (editableTurnIndex !== -1 && editableTurnIndex < canonicalUserMessages.length) {
      const matchedMessageId = canonicalUserMessages[editableTurnIndex]!.id!;
      const matchedIndex = messages.findIndex((message) => message.id === matchedMessageId);
      return {
        messageId: matchedMessageId,
        truncateAtMessageIndex: matchedIndex === -1 ? 0 : matchedIndex,
      };
    }

    const promptMatch = canonicalUserMessages.find((message) => message.content.trim() === targetTurn.prompt.trim());
    if (promptMatch?.id) {
      const matchedIndex = messages.findIndex((message) => message.id === promptMatch.id);
      return {
        messageId: promptMatch.id,
        truncateAtMessageIndex: matchedIndex === -1 ? 0 : matchedIndex,
      };
    }

    if (canonicalUserMessages.length === 1 && canonicalUserMessages[0]?.id) {
      const matchedIndex = messages.findIndex((message) => message.id === canonicalUserMessages[0]!.id);
      return {
        messageId: canonicalUserMessages[0].id!,
        truncateAtMessageIndex: matchedIndex === -1 ? 0 : matchedIndex,
      };
    }

    if (fallbackMessageId) {
      return {
        messageId: fallbackMessageId,
        truncateAtMessageIndex: 0,
      };
    }

    throw new Error("Message not found.");
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
      editBoundary = await resolveEditableTurnBoundary(turnId);
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
      [turnId]: true,
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
            defaultLatestExpanded: true,
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
                defaultLatestExpanded: true,
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

    setPendingForkConfiguration({
      source: "message",
      sourceThreadId: currentThreadId,
      stagedPrompt: turn.prompt,
      quotedSelection: turn.quotedSelection || null,
      turn,
    });
    setForkTarget("existing_environment");
    setForkTargetEnvironmentId(sourceThreadEnvironmentId || selectedEnvironmentId || environmentId || "");
    setForkNewEnvironmentName(buildSuggestedForkEnvironmentName());
    setForkNewEnvironmentFileCopyMode("all");
    setForkExistingEnvironmentFileCopyMode("none");
    setShowForkEnvironmentPopup(false);
    setForkDialogError(null);
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

  function submitThreadFeedback(rating: RunnerThreadFeedbackRating) {
    const normalizedThreadId = String(currentThreadId || "").trim();
    if (!normalizedThreadId || !normalizedBackendUrl || !hasApiKey) {
      return;
    }
    setThreadFeedbackState((previous) => ({
      ...previous,
      userRating: rating,
      upCount:
        previous.userRating === rating
          ? previous.upCount
          : rating === "up"
            ? previous.upCount + 1
            : Math.max(0, previous.upCount - (previous.userRating === "up" ? 1 : 0)),
      downCount:
        previous.userRating === rating
          ? previous.downCount
          : rating === "down"
            ? previous.downCount + 1
            : Math.max(0, previous.downCount - (previous.userRating === "down" ? 1 : 0)),
      isSubmitting: true,
    }));
    void setThreadFeedback({
      backendUrl: normalizedBackendUrl,
      apiKey: apiKey.trim(),
      threadId: normalizedThreadId,
      rating,
      requestHeaders,
    })
      .then((feedback) => {
        setThreadFeedbackState({ ...feedback, isSubmitting: false });
      })
      .catch(() => {
        setThreadFeedbackState((previous) => ({ ...previous, isSubmitting: false }));
      });
  }

  function openReportIssueModal(turn: RunnerTurn, summaryText: string) {
    if (!currentThreadId || !normalizedBackendUrl || !hasApiKey) {
      setInlineError("Reporting an issue requires a saved thread.");
      return;
    }
    setRunSummaryMoreTurnId(null);
    setReportIssueTurn({ turnId: turn.id, summaryText });
    setReportIssueType("bug");
    setReportIssueMessage("");
    setReportIssueError("");
    setIsReportIssueSubmitting(false);
  }

  function closeReportIssueModal() {
    if (isReportIssueSubmitting) {
      return;
    }
    setReportIssueTurn(null);
    setReportIssueMessage("");
    setReportIssueError("");
  }

  async function submitReportIssue() {
    const normalizedThreadId = String(currentThreadId || "").trim();
    const message = reportIssueMessage.trim();
    if (!reportIssueTurn || !normalizedThreadId || !normalizedBackendUrl || !hasApiKey) {
      setReportIssueError("Reporting an issue requires a saved thread.");
      return;
    }
    if (!message) {
      setReportIssueError("Describe the issue before sending.");
      return;
    }

    setIsReportIssueSubmitting(true);
    setReportIssueError("");
    try {
      await reportThreadFeedbackIssue({
        backendUrl: normalizedBackendUrl,
        apiKey: apiKey.trim(),
        threadId: normalizedThreadId,
        reportType: reportIssueType,
        message,
        requestHeaders,
        metadata: {
          turnId: reportIssueTurn.turnId,
          summary: stripSystemTags(reportIssueTurn.summaryText).trim().slice(0, 4000),
          url: typeof window !== "undefined" ? window.location.href : "",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        },
      });
      setThreadFeedbackState((previous) => ({
        ...previous,
        reportCount: previous.reportCount + 1,
      }));
      setReportIssueTurn(null);
      setReportIssueMessage("");
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setReportIssueError(normalizedError.message || "Failed to report issue.");
    } finally {
      setIsReportIssueSubmitting(false);
    }
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

  function renderComputeTokenUpgradeLogBox(message: string) {
    const normalizedMessage = sanitizeRunnerBudgetMessage(stripSystemTags(message)).trim()
      || "Add credits or upgrade your plan to continue.";
    return (
      <div className="tb-compute-token-log-box" role="status">
        <div className="tb-compute-token-log-copy">
          <div className="tb-compute-token-log-heading">
            <LucideZap className="tb-compute-token-log-icon" strokeWidth={1.8} />
            <span>No credits left</span>
          </div>
          <div className="tb-compute-token-log-message">{normalizedMessage}</div>
        </div>
        <button
          type="button"
          className="tb-compute-token-log-button"
          onClick={openPlansBudgetFromComputeTokenLog}
        >
          Open Plans &amp; Budget
        </button>
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
      return renderComputeTokenUpgradeLogBox(agentMessage.message);
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
          <button
            type="button"
            className="tb-run-summary-action-button"
            data-label="Copy"
            title="Copy run summary"
            aria-label="Copy run summary"
            onClick={() => {
              void copyRunSummaryText(summaryText);
            }}
          >
            <LucideCopy className="tb-run-summary-action-icon" strokeWidth={2} />
          </button>
          <button
            type="button"
            className="tb-run-summary-action-button"
            data-label="Fork"
            title="Fork from message"
            aria-label="Fork from message"
            onClick={() => openForkDialogForTurn(turn)}
          >
            {isForkingThisTurn ? (
              <LucideLoaderCircle className="tb-run-summary-action-icon tb-context-action-notice-icon-spinner" strokeWidth={2} />
            ) : (
              <LucideSplit className="tb-run-summary-action-icon" strokeWidth={2} />
            )}
          </button>
          <button
            type="button"
            className={`tb-run-summary-action-button ${threadFeedback.userRating === "up" ? "is-active" : ""}`.trim()}
            data-label="Good"
            title="Mark as helpful"
            aria-label="Mark as helpful"
            aria-pressed={threadFeedback.userRating === "up"}
            onClick={() => submitThreadFeedback("up")}
          >
            <LucideThumbsUp className="tb-run-summary-action-icon" strokeWidth={2} />
          </button>
          <button
            type="button"
            className={`tb-run-summary-action-button ${threadFeedback.userRating === "down" ? "is-active" : ""}`.trim()}
            data-label="Bad"
            title="Mark as not helpful"
            aria-label="Mark as not helpful"
            aria-pressed={threadFeedback.userRating === "down"}
            onClick={() => submitThreadFeedback("down")}
          >
            <LucideThumbsDown className="tb-run-summary-action-icon" strokeWidth={2} />
          </button>
          <button
            type="button"
            className="tb-run-summary-action-button"
            data-label="Rerun"
            title="Rerun from message"
            aria-label="Rerun from message"
            onClick={() => rerunTurnFromSummary(turn)}
          >
            <LucideRefreshCw className="tb-run-summary-action-icon" strokeWidth={2} />
          </button>
          <span className="tb-run-summary-more-anchor" ref={isMoreMenuOpen ? runSummaryMoreMenuRef : undefined}>
            <button
              type="button"
              className={`tb-run-summary-action-button ${isMoreMenuOpen ? "is-open" : ""}`.trim()}
              data-label="More"
              title="More"
              aria-label="More"
              aria-haspopup="menu"
              aria-expanded={isMoreMenuOpen}
              onClick={(event) => {
                event.stopPropagation();
                setEmailDeliveryAttachmentsTurnId(null);
                setRunSummaryMoreTurnId((current) => current === turn.id ? null : turn.id);
              }}
            >
              <LucideEllipsis className="tb-run-summary-action-icon" strokeWidth={2} />
            </button>
            {isMoreMenuOpen ? (
              <PlatformPopupSurface className="tb-run-summary-more-menu" role="menu" onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  className="tb-run-summary-more-menu-item"
                  role="menuitem"
                  onClick={() => openReportIssueModal(turn, summaryText)}
                >
                  Report issue
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

    setPendingForkConfiguration({
      source: "thread",
      sourceThreadId: currentThreadId,
      stagedPrompt: prompt,
      attachments: options?.includeCurrentAttachments === false ? [] : attachments.slice(),
      quotedSelection: composerQuotedSelection,
      restoreSelectedEnvironmentId: options?.restoreSelectedEnvironmentId ?? null,
    });
    setForkTarget("existing_environment");
    setForkTargetEnvironmentId(
      options?.preselectedTargetEnvironmentId || sourceThreadEnvironmentId || selectedEnvironmentId || environmentId || ""
    );
    setForkNewEnvironmentName(buildSuggestedForkEnvironmentName());
    setForkNewEnvironmentFileCopyMode("all");
    setForkExistingEnvironmentFileCopyMode(options?.initialExistingEnvironmentFileCopyMode || "none");
    setShowForkEnvironmentPopup(false);
    setForkDialogError(null);
  }

  function cancelPendingForkConfiguration() {
    const restoreSelectedEnvironmentId = pendingForkConfiguration?.restoreSelectedEnvironmentId;
    resetForkConfiguration();
    if (typeof restoreSelectedEnvironmentId === "string") {
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
    setThreadContext(null);
    setThreadContextDetails(null);
    setThreadContextDetailsError(null);
    setThreadContextNativeError(null);
    setThreadContextAvailableActions(DEFAULT_THREAD_CONTEXT_ACTIONS);
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
          ? (await resolveEditableTurnBoundary(pendingFork.turn.id)).truncateAtMessageIndex
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
    initializedThreadHistoryIdRef,
    locallyOwnedExecutionThreadIdRef,
    normalizedBackendUrl,
    normalizeIntentionalStopError,
    notifyTaskListChange,
    onCustomSkillsLoaded: (loadedSkills, succeeded) => {
      if (succeeded && loadedSkills) {
        setCustomSkills(loadedSkills);
        setCustomSkillsLoaded(true);
        return;
      }
      setCustomSkillsLoaded(false);
    },
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

  useEffect(() => {
    screenFileDragActiveRef.current = isScreenFileDragActive;
  }, [isScreenFileDragActive]);

  useEffect(() => {
    if (!isScreenFileDragActive) {
      return;
    }
    const clearScreenFileDrag = () => {
      screenFileDragActiveRef.current = false;
      setIsScreenFileDragActive(false);
    };
    window.addEventListener("drop", clearScreenFileDrag);
    window.addEventListener("dragend", clearScreenFileDrag);
    window.addEventListener("blur", clearScreenFileDrag);
    return () => {
      window.removeEventListener("drop", clearScreenFileDrag);
      window.removeEventListener("dragend", clearScreenFileDrag);
      window.removeEventListener("blur", clearScreenFileDrag);
    };
  }, [isScreenFileDragActive]);

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
        displayPromptOverride: typeof request.displayPrompt === "string"
          ? request.displayPrompt
          : undefined,
        slideCreationCommand: request.slideCreationCommand || null,
        researchCreationCommand: request.researchCreationCommand || null,
        scrapeCreationCommand: request.scrapeCreationCommand || null,
        parseCreationCommand: request.parseCreationCommand || null,
        adCreationCommand: request.adCreationCommand || null,
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
    const resolvedThreadId = currentThreadId;
    if (!normalizedBackendUrl) {
      throw new Error("backendUrl is required.");
    }
    if (!apiKey) {
      throw new Error("apiKey is required.");
    }
    if (!resolvedThreadId) {
      throw new Error("Start a conversation first before using this context action.");
    }

    setThreadContextActionLoading(action);
    setThreadContextDetailsError(null);
    let pendingNoticeTurnId: string | null = null;

    try {
      if (action === "compact") {
        pendingNoticeTurnId = appendPendingThreadContextActionNotice("compact", "Compacting context", {
          prompt: options?.commandText || formatThreadContextCommandText("compact", options?.prompt),
        });
      }

      const actionPayload = await requestRunnerThreadContextAction({
        backendUrl: normalizedBackendUrl,
        apiKey,
        requestHeaders,
        threadId: resolvedThreadId,
        action,
        prompt: options?.prompt,
      });
      const commandText = options?.commandText || `/${action}`;
      const responseText = actionPayload.responseText || actionPayload.message || `Completed /${action}.`;

      if (action === "fork") {
        const nextThreadId = actionPayload.thread?.id;
        if (!nextThreadId) {
          throw new Error("Fork completed without returning a new thread.");
        }
        setLocalThreadId(nextThreadId);
        try {
          onThreadIdChange?.(nextThreadId);
        } catch (error) {
          reportRunnerLifecycleCallbackError("onThreadIdChange", error);
        }
        appendThreadContextActionNotice("fork", "Forked into a new conversation");
        refreshThreadContextDetailsInBackground(nextThreadId);
        return;
      }

      if (action === "clear") {
        setThreadContext(null);
        setThreadContextDetails(null);
        appendThreadContextActionNotice("clear", "Context was cleared");
      } else if (action === "compact") {
        if (pendingNoticeTurnId) {
          updateThreadContextActionNotice(pendingNoticeTurnId, "Context was compacted");
        } else {
          appendThreadContextActionNotice("compact", "Context was compacted");
        }
      } else if (action === "btw") {
        appendSyntheticActionTurn(commandText, responseText, "Asked side question", {
          presentation: "btw",
        });
      }

      refreshThreadContextDetailsInBackground(resolvedThreadId);
    } catch (error) {
      if (action === "compact" && pendingNoticeTurnId) {
        updateThreadContextActionNotice(pendingNoticeTurnId, "Failed to compact context", { failed: true });
      }
      throw error;
    } finally {
      setThreadContextActionLoading(null);
    }
  }

  useEffect(() => {
    mountRunnerChatStyles();
  }, []);

  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const activeClassName = "tb-runner-document-preview-active";
    const maximizedClassName = "tb-runner-document-preview-maximized";
    document.body.classList.toggle(activeClassName, Boolean(previewedDocumentAttachment));
    document.body.classList.toggle(maximizedClassName, Boolean(previewedDocumentAttachment && isDocumentPreviewMaximized));
    return () => {
      document.body.classList.remove(activeClassName);
      document.body.classList.remove(maximizedClassName);
    };
  }, [isDocumentPreviewMaximized, previewedDocumentAttachment]);

  useEffect(() => {
    setDocumentPreviewDrawerWidth(null);
    documentPreviewResizeStateRef.current = null;
    setDocumentPreviewActionMenuOpen(false);
    setPreviewImageSelectionState(null);
  }, [previewedDocumentAttachment?.id]);

  useEffect(() => {
    if (!initialDocumentPreviewAttachment) {
      return;
    }

    const attachmentRecord = typeof initialDocumentPreviewAttachment === "object"
      ? initialDocumentPreviewAttachment as Record<string, unknown>
      : {};
    const requestToken =
      initialDocumentPreviewToken ??
      String(
        attachmentRecord.id ||
        attachmentRecord.workspacePath ||
        attachmentRecord.filename ||
        ""
      ).trim();

    if (requestToken === null || requestToken === "" || handledInitialDocumentPreviewTokenRef.current === requestToken) {
      return;
    }

    const normalizedAttachment = normalizeTurnAttachment(initialDocumentPreviewAttachment, normalizedBackendUrl);
    if (!normalizedAttachment || !isAttachmentDocumentPreviewable(normalizedAttachment)) {
      return;
    }

    handledInitialDocumentPreviewTokenRef.current = requestToken;
    closeDeepResearchDetailDrawer();
    closeSubagentDetailDrawer();
    closeComputerUseDetailDrawer();
    setDocumentPreviewActionMenuOpen(false);
    setIsDocumentPreviewMaximized(false);
    setPreviewedDocumentAttachment(normalizedAttachment);
  }, [initialDocumentPreviewAttachment, initialDocumentPreviewToken, normalizedBackendUrl]);

  useEffect(() => {
    if (!documentPreviewActionMenuOpen || typeof document === "undefined") {
      return;
    }

    function handleDocumentPreviewActionMenuPointerDown(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && documentPreviewActionMenuRef.current?.contains(target)) {
        return;
      }
      setDocumentPreviewActionMenuOpen(false);
    }

    document.addEventListener("pointerdown", handleDocumentPreviewActionMenuPointerDown);
    return () => document.removeEventListener("pointerdown", handleDocumentPreviewActionMenuPointerDown);
  }, [documentPreviewActionMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      const resizeState = documentPreviewResizeStateRef.current;
      if (!resizeState) {
        return;
      }
      const minWidth = 360;
      const maxWidth = Math.max(minWidth, Math.min(960, window.innerWidth - 220));
      const nextWidth = Math.max(minWidth, Math.min(maxWidth, resizeState.startWidth + (resizeState.startX - event.clientX)));
      setDocumentPreviewDrawerWidth(nextWidth);
    }

    function stopResize() {
      documentPreviewResizeStateRef.current = null;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResize);
    window.addEventListener("pointercancel", stopResize);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResize);
      window.removeEventListener("pointercancel", stopResize);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (mainPopupAnimationTimerRef.current !== null) {
        window.clearTimeout(mainPopupAnimationTimerRef.current);
      }
      if (sidePopupAnimationTimerRef.current !== null) {
        window.clearTimeout(sidePopupAnimationTimerRef.current);
      }
      if (composerQuotedSelectionAnimationTimerRef.current !== null) {
        window.clearTimeout(composerQuotedSelectionAnimationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (composerQuotedSelectionAnimationTimerRef.current !== null) {
      window.clearTimeout(composerQuotedSelectionAnimationTimerRef.current);
      composerQuotedSelectionAnimationTimerRef.current = null;
    }

    if (composerQuotedSelection) {
      setRenderedComposerQuotedSelection(composerQuotedSelection);
      const animationFrameId = window.requestAnimationFrame(() => {
        setIsComposerQuotedSelectionVisible(true);
      });
      return () => window.cancelAnimationFrame(animationFrameId);
    }

    setIsComposerQuotedSelectionVisible(false);
    if (!renderedComposerQuotedSelection) {
      return;
    }

    composerQuotedSelectionAnimationTimerRef.current = window.setTimeout(() => {
      setRenderedComposerQuotedSelection(null);
      composerQuotedSelectionAnimationTimerRef.current = null;
    }, COMPOSER_QUOTED_SELECTION_ANIMATION_MS);

    return () => {
      if (composerQuotedSelectionAnimationTimerRef.current !== null) {
        window.clearTimeout(composerQuotedSelectionAnimationTimerRef.current);
        composerQuotedSelectionAnimationTimerRef.current = null;
      }
    };
  }, [composerQuotedSelection, renderedComposerQuotedSelection]);

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
      setPreviewedDocumentAttachment(null);
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
    setThreadContextDetails(null);
    setThreadContextDetailsError(null);
    setThreadContextNativeError(null);
    setThreadContextAvailableActions(DEFAULT_THREAD_CONTEXT_ACTIONS);
    setDeepResearchSessions([]);
    setHydratedThreadStatus(null);
    setPendingQueuedMessages([]);
    stopRequestedThreadIdRef.current = null;
    setIsStoppingRun(false);
    setEditingTurnId(null);
    setEditingTurnDraft("");
    setForkingTurnId(null);
    setPendingEditConfirmation(null);
    isDrainingQueuedRunsRef.current = false;
    if (locallyOwnedExecutionThreadIdRef.current !== currentThreadId) {
      locallyOwnedExecutionThreadIdRef.current = null;
    }
  }, [currentThreadId]);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: number | null = null;
    const resolvedThreadId = String(currentThreadId || "").trim();

    if (!resolvedThreadId || !hasApiKey || !normalizedBackendUrl || !shouldRefreshDeepResearchSessions) {
      setDeepResearchSessions((currentSessions) => (currentSessions.length > 0 ? [] : currentSessions));
      return () => {
        cancelled = true;
      };
    }

    const poll = async () => {
      try {
        await refreshDeepResearchSessions(resolvedThreadId);
      } catch {
        // Keep existing session state on transient fetch failures.
      } finally {
        if (!cancelled && shouldPollDeepResearchSessions) {
          pollTimer = window.setTimeout(poll, 3000);
        }
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (pollTimer !== null) {
        window.clearTimeout(pollTimer);
      }
    };
  }, [
    apiKey,
    currentThreadId,
    hasApiKey,
    normalizedBackendUrl,
    requestHeaders,
    shouldPollDeepResearchSessions,
    shouldRefreshDeepResearchSessions,
  ]);

  useEffect(() => {
    let cancelled = false;

    if (!currentThreadId || !hasApiKey || isRunning) {
      if (!currentThreadId) {
        setThreadContext(null);
      }
      setIsThreadContextLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setIsThreadContextLoading(true);
    void fetchThreadContextEstimate(currentThreadId)
      .then((context) => {
        if (!cancelled) {
          setThreadContext(context);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setThreadContext(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsThreadContextLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, currentThreadId, hasApiKey, isRunning, normalizedBackendUrl, requestHeaders]);

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
    if (renderedMainPopup !== "context") {
      return;
    }
    if (threadContextDetails?.threadId === currentThreadId && !threadContextDetailsError) {
      return;
    }
    void refreshThreadContextDetails();
  }, [
    apiKey,
    currentThreadId,
    hasApiKey,
    normalizedBackendUrl,
    renderedMainPopup,
    requestHeaders,
    threadContextDetails?.threadId,
    threadContextDetailsError,
  ]);

  useEffect(() => {
    if (mainPopupAnimationTimerRef.current !== null) {
      window.clearTimeout(mainPopupAnimationTimerRef.current);
      mainPopupAnimationTimerRef.current = null;
    }

    if (targetMainPopup === null) {
      if (renderedMainPopup !== null) {
        setMainPopupPhase("exit");
        mainPopupAnimationTimerRef.current = window.setTimeout(() => {
          setRenderedMainPopup(null);
          setMainPopupPhase("idle");
          mainPopupAnimationTimerRef.current = null;
        }, POPUP_ANIMATION_DURATION_MS);
      }
      return;
    }

    setRenderedMainPopup(targetMainPopup);
    setMainPopupPhase("enter");
    mainPopupAnimationTimerRef.current = window.setTimeout(() => {
      setMainPopupPhase("idle");
      mainPopupAnimationTimerRef.current = null;
    }, POPUP_ANIMATION_DURATION_MS);
  }, [renderedMainPopup, targetMainPopup]);

  useEffect(() => {
    if (sidePopupAnimationTimerRef.current !== null) {
      window.clearTimeout(sidePopupAnimationTimerRef.current);
      sidePopupAnimationTimerRef.current = null;
    }

    if (targetSidePopup === null) {
      if (renderedSidePopup !== null) {
        setSidePopupPhase("exit");
        sidePopupAnimationTimerRef.current = window.setTimeout(() => {
          setRenderedSidePopup(null);
          setSidePopupPhase("idle");
          setSidePopupExitDirection("left");
          sidePopupAnimationTimerRef.current = null;
        }, POPUP_ANIMATION_DURATION_MS);
      }
      return;
    }

    setSidePopupExitDirection("left");
    setRenderedSidePopup(targetSidePopup);
    setSidePopupPhase("enter");
    sidePopupAnimationTimerRef.current = window.setTimeout(() => {
      setSidePopupPhase("idle");
      sidePopupAnimationTimerRef.current = null;
    }, POPUP_ANIMATION_DURATION_MS);
  }, [renderedSidePopup, targetSidePopup]);

  useEffect(() => {
    if (!showForkEnvironmentPopup) {
      return;
    }

    const handlePointerDown = (event: Event) => {
      const target = event.target as Node | null;
      if (forkEnvironmentPopupRef.current && target && !forkEnvironmentPopupRef.current.contains(target)) {
        setShowForkEnvironmentPopup(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showForkEnvironmentPopup]);

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

  useEffect(() => {
    if (!agents.length) return;
    setSelectedAgentId((current) => {
      if (agentId && agents.some((agent) => agent.id === agentId)) {
        return agentId;
      }
      if (current && agents.some((agent) => agent.id === current)) {
        return current;
      }
      return getRunnerPreferredDefaultAgentOption(agents)?.id || "";
    });
  }, [agentId, agents]);

  useEffect(() => {
    if (controlledReasoningEffort === undefined) {
      return;
    }
    setSelectedReasoningEffort(normalizeRunnerReasoningEffort(controlledReasoningEffort));
  }, [controlledReasoningEffort]);

  useEffect(() => {
    if (!agents.length) {
      setInitialAgentTopId(null);
      return;
    }
    if (initialAgentTopId && agents.some((agent) => agent.id === initialAgentTopId)) {
      return;
    }
    if (agentId && agents.some((agent) => agent.id === agentId)) {
      setInitialAgentTopId(agentId);
      return;
    }
    if (selectedAgentId && agents.some((agent) => agent.id === selectedAgentId)) {
      setInitialAgentTopId(selectedAgentId);
      return;
    }
    setInitialAgentTopId(getRunnerPreferredDefaultAgentOption(agents)?.id || null);
  }, [agentId, agents, initialAgentTopId, selectedAgentId]);

  useEffect(() => {
    if (activeInputPopup !== "agent" && activeInputPopup !== "agent-reasoning") {
      hasInitializedOpenAgentPopupModeRef.current = false;
      return;
    }
    if (hasInitializedOpenAgentPopupModeRef.current) {
      return;
    }
    hasInitializedOpenAgentPopupModeRef.current = true;
    const nextSelectedAgent =
      agents.find((agent) => agent.id === selectedAgentId) ||
      (agentId ? agents.find((agent) => agent.id === agentId) : null) ||
      getRunnerPreferredDefaultAgentOption(agents) ||
      null;
    setAgentPopupMode(getRunnerAgentSelectorMode(nextSelectedAgent));
  }, [activeInputPopup, agentId, agents, selectedAgentId]);

  useEffect(() => {
    if (!availableEnvironments.length) return;
    setSelectedEnvironmentId((current) => {
      if (
        scopedActiveThreadEnvironmentId &&
        availableEnvironments.some((environment) => environment.id === scopedActiveThreadEnvironmentId)
      ) {
        return scopedActiveThreadEnvironmentId;
      }
      if (
        effectiveWorkspaceSelectorMode === "projects" &&
        selectedProjectEnvironmentId &&
        availableEnvironments.some((environment) => environment.id === selectedProjectEnvironmentId)
      ) {
        return selectedProjectEnvironmentId;
      }
      if (current && availableEnvironments.some((environment) => environment.id === current)) {
        return current;
      }
      if (environmentId && availableEnvironments.some((environment) => environment.id === environmentId)) {
        return environmentId;
      }
      return availableEnvironments.find((environment) => environment.isDefault)?.id || availableEnvironments[0]?.id || "";
    });
  }, [availableEnvironments, effectiveWorkspaceSelectorMode, environmentId, scopedActiveThreadEnvironmentId, selectedProjectEnvironmentId]);

  useEffect(() => {
    if (!useComputerAgentsMode) {
      return;
    }

    const configuredProjectId = String(projectsConfig?.selectedProjectId || "").trim();
    if (!configuredProjectId) {
      lastAppliedControlledProjectIdRef.current = configuredProjectId;
      return;
    }
    if (lastAppliedControlledProjectIdRef.current === configuredProjectId) {
      return;
    }

    const persistedWorkspaceSelection = !workspacePreferenceAppliedRef.current
      ? loadPersistedWorkspaceSelection(workspaceSelectionStorageKey)
      : null;
    const hasActiveProjectWorkspaceSelection =
      (workspaceSelectorMode === "projects" && Boolean(selectedProjectId)) ||
      (persistedWorkspaceSelection?.mode === "projects" && Boolean(persistedWorkspaceSelection.projectId));
    if (!hasActiveProjectWorkspaceSelection) {
      lastAppliedControlledProjectIdRef.current = configuredProjectId;
      return;
    }

    const configuredProject = availableProjects.find((project) => project.id === configuredProjectId) || null;
    if (!configuredProject) {
      return;
    }

    const configuredEnvironmentId = getRunnerProjectEnvironmentId(configuredProject);
    if (!configuredEnvironmentId) {
      return;
    }

    lastAppliedControlledProjectIdRef.current = configuredProjectId;
    workspacePreferenceAppliedRef.current = true;
    setWorkspaceSelectorMode("projects");
    setSelectedProjectId(configuredProjectId);
    setSelectedEnvironmentId(configuredEnvironmentId);
    persistWorkspaceSelection(workspaceSelectionStorageKey, {
      mode: "projects",
      projectId: configuredProjectId,
      environmentId: configuredEnvironmentId,
    });
  }, [availableProjects, projectsConfig?.selectedProjectId, selectedProjectId, useComputerAgentsMode, workspaceSelectionStorageKey, workspaceSelectorMode]);

  useEffect(() => {
    if (!useComputerAgentsMode || workspacePreferenceAppliedRef.current) {
      return;
    }

    const persisted = loadPersistedWorkspaceSelection(workspaceSelectionStorageKey);
    if (!persisted) {
      workspacePreferenceAppliedRef.current = true;
      return;
    }

    if (persisted.mode === "projects" && persisted.projectId) {
      if (availableProjects.length === 0) {
        return;
      }
      const persistedProject = availableProjects.find((project) => project.id === persisted.projectId) || null;
      if (persistedProject) {
        const persistedEnvironmentId = getRunnerProjectEnvironmentId(persistedProject);
        if (persistedEnvironmentId) {
          setWorkspaceSelectorMode("projects");
          setSelectedProjectId(persisted.projectId);
          setSelectedEnvironmentId(persistedEnvironmentId);
        }
      }
      workspacePreferenceAppliedRef.current = true;
      return;
    }

    if (persisted.mode === "computers" && persisted.environmentId) {
      if (availableEnvironments.length === 0) {
        return;
      }
      if (availableEnvironments.some((environment) => environment.id === persisted.environmentId)) {
        setWorkspaceSelectorMode("computers");
        setSelectedProjectId("");
        setSelectedEnvironmentId(persisted.environmentId);
      }
    }
    workspacePreferenceAppliedRef.current = true;
  }, [availableEnvironments, availableProjects, useComputerAgentsMode, workspaceSelectionStorageKey]);

  useEffect(() => {
    if (!selectedProjectId || availableProjects.length === 0) {
      return;
    }
    if (availableProjects.some((project) => project.id === selectedProjectId)) {
      return;
    }
    setSelectedProjectId("");
    setWorkspaceSelectorMode("computers");
  }, [availableProjects, selectedProjectId]);

  useEffect(() => {
    if (!availableEnvironments.length) {
      setInitialEnvironmentTopId(null);
      return;
    }
    if (initialEnvironmentTopId && availableEnvironments.some((environment) => environment.id === initialEnvironmentTopId)) {
      return;
    }
    if (
      scopedActiveThreadEnvironmentId &&
      availableEnvironments.some((environment) => environment.id === scopedActiveThreadEnvironmentId)
    ) {
      setInitialEnvironmentTopId(scopedActiveThreadEnvironmentId);
      return;
    }
    if (environmentId && availableEnvironments.some((environment) => environment.id === environmentId)) {
      setInitialEnvironmentTopId(environmentId);
      return;
    }
    if (selectedEnvironmentId && availableEnvironments.some((environment) => environment.id === selectedEnvironmentId)) {
      setInitialEnvironmentTopId(selectedEnvironmentId);
      return;
    }
    setInitialEnvironmentTopId(availableEnvironments.find((environment) => environment.isDefault)?.id || availableEnvironments[0]?.id || null);
  }, [availableEnvironments, environmentId, initialEnvironmentTopId, scopedActiveThreadEnvironmentId, selectedEnvironmentId]);

  useEffect(() => {
    if (controlledEnabledSkillIdsList !== null) {
      return;
    }
    const persisted = loadPersistedEnabledSkillIds(enabledSkillsStorageKey);
    const nextEnabledSkillIds = persisted !== null ? persisted : defaultEnabledSkillIds(normalizedSkills);
    setEnabledSkillIds((current) => (areStringArraysEqual(current, nextEnabledSkillIds) ? current : nextEnabledSkillIds));
  }, [controlledEnabledSkillIdsList, enabledSkillsStorageKey, normalizedSkills]);

  useEffect(() => {
    if (controlledEnabledSkillIdsList === null) {
      return;
    }
    setEnabledSkillIds((current) => (areStringArraysEqual(current, controlledEnabledSkillIdsList) ? current : controlledEnabledSkillIdsList));
  }, [controlledEnabledSkillIdsList]);

  useEffect(() => {
    persistEnabledSkillIds(enabledSkillsStorageKey, enabledSkillIds);
  }, [enabledSkillIds, enabledSkillsStorageKey]);

  useEffect(() => {
    if (activeInputPopup !== "skills" || !fetchCustomSkills || customSkillsLoaded || isLoadingCustomSkills) {
      return;
    }

    let cancelled = false;
    setIsLoadingCustomSkills(true);

    void fetchCustomSkills()
      .then((loadedSkills) => {
        if (cancelled) return;
        const filtered = (loadedSkills || []).filter((skill) => skill.isCustom);
        setCustomSkills(filtered);
        setCustomSkillsLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setCustomSkills([]);
        setCustomSkillsLoaded(true);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingCustomSkills(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeInputPopup, customSkillsLoaded, fetchCustomSkills]);

  useEffect(() => {
    setCustomSkills([]);
    setCustomSkillsLoaded(false);
  }, [fetchCustomSkills]);

  useEffect(() => {
    setSelectedGithubRepositoryId((current) => {
      if (githubConfig?.selectedRepositoryId && githubRepositories.some((repository) => repository.id === githubConfig.selectedRepositoryId)) {
        return githubConfig.selectedRepositoryId;
      }
      if (current && githubRepositories.some((repository) => repository.id === current)) {
        return current;
      }
      return githubRepositories[0]?.id || "";
    });
  }, [githubConfig?.selectedRepositoryId, githubRepositories]);

  useEffect(() => {
    setSelectedGithubContextId((current) => {
      if (githubConfig?.selectedContextId && githubContexts.some((context) => context.id === githubConfig.selectedContextId)) {
        return githubConfig.selectedContextId;
      }
      if (current && githubContexts.some((context) => context.id === current)) {
        return current;
      }
      return githubContexts[0]?.id || "";
    });
  }, [githubConfig?.selectedContextId, githubContexts]);

  useEffect(() => {
    setSelectedNotionDatabaseId((current) => {
      if (notionConfig?.selectedDatabaseId && notionDatabases.some((database) => database.id === notionConfig.selectedDatabaseId)) {
        return notionConfig.selectedDatabaseId;
      }
      if (current && notionDatabases.some((database) => database.id === current)) {
        return current;
      }
      return "";
    });
  }, [notionConfig?.selectedDatabaseId, notionDatabases]);

  useEffect(() => {
    setSelectedSchedulePresetId((current) => {
      if (current && schedulePresets.some((preset) => preset.id === current)) return current;
      return schedulePresets[0]?.id || "";
    });
  }, [schedulePresets]);

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
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    currentInputRef.current = input;
  }, [input]);

  useEffect(() => {
    if (!autoFocusComposer) {
      return;
    }
    focusComposerSoon({ preventScroll: hasCustomEmptyStateActive });
  }, [autoFocusComposer, hasCustomEmptyStateActive]);

  useEffect(() => {
    if (!enableBacklogSubtaskCommand || !backlogSubtaskCommand?.ticketNumber) {
      return;
    }
    if (appliedBacklogSubtaskCommandTokenRef.current === backlogSubtaskCommand.token) {
      return;
    }
    appliedBacklogSubtaskCommandTokenRef.current = backlogSubtaskCommand.token;
    closeAllInputPopups();
    stageBacklogSubtaskCommand(backlogSubtaskCommand.ticketNumber);
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [backlogSubtaskCommand, enableBacklogSubtaskCommand]);

  useEffect(() => {
    if (!enableBacklogMissionControlCommand || !backlogMissionControlCommand) {
      return;
    }
    if (appliedBacklogMissionControlCommandTokenRef.current === backlogMissionControlCommand.token) {
      return;
    }
    appliedBacklogMissionControlCommandTokenRef.current = backlogMissionControlCommand.token;
    closeAllInputPopups();
    stageBacklogMissionControlCommand();
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [backlogMissionControlCommand, enableBacklogMissionControlCommand]);

  useEffect(() => {
    if (!enableResourceCreationCommand || !resourceCreationCommand) {
      return;
    }
    if (appliedResourceCreationCommandTokenRef.current === resourceCreationCommand.token) {
      return;
    }
    appliedResourceCreationCommandTokenRef.current = resourceCreationCommand.token;
    closeAllInputPopups();
    stageResourceCreationCommand(resourceCreationCommand.type);
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [enableResourceCreationCommand, resourceCreationCommand]);

  useEffect(() => {
    onResourceCreationCommandChange?.(stagedResourceCreationCommand?.action || null);
  }, [onResourceCreationCommandChange, stagedResourceCreationCommand]);

  useEffect(() => {
    if (!enableAgentCreationCommand || !agentCreationCommand) {
      return;
    }
    if (appliedAgentCreationCommandTokenRef.current === agentCreationCommand.token) {
      return;
    }
    appliedAgentCreationCommandTokenRef.current = agentCreationCommand.token;
    closeAllInputPopups();
    stageAgentCreationCommand(agentCreationCommand.type);
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [agentCreationCommand, enableAgentCreationCommand]);

  useEffect(() => {
    onAgentCreationCommandChange?.(stagedAgentCreationCommand?.action || null);
  }, [onAgentCreationCommandChange, stagedAgentCreationCommand]);

  useEffect(() => {
    if (!enableSkillCreationCommand || !skillCreationCommand) {
      return;
    }
    if (appliedSkillCreationCommandTokenRef.current === skillCreationCommand.token) {
      return;
    }
    appliedSkillCreationCommandTokenRef.current = skillCreationCommand.token;
    closeAllInputPopups();
    stageSkillCreationCommand(skillCreationCommand.type);
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [enableSkillCreationCommand, skillCreationCommand]);

  useEffect(() => {
    onSkillCreationCommandChange?.(stagedSkillCreationCommand?.action || null);
  }, [onSkillCreationCommandChange, stagedSkillCreationCommand]);

  useEffect(() => {
    return () => {
      for (const attachment of attachmentsRef.current) {
        revokeAttachmentPreview(attachment);
      }
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    void stopSpeechToText();
  }, [isRunning, stopSpeechToText]);

  async function ensureThread(taskText: string, options?: { reserveLocalExecution?: boolean }): Promise<{
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

  function resolveAttachmentUploadEnvironmentId(): string | null {
    if (currentThreadId) {
      return activeThreadEnvironmentId || selectedEnvironment?.id || environmentId || null;
    }
    return effectiveEnvironmentId || selectedEnvironment?.id || environmentId || null;
  }

  function updateTurnAttachmentState(
    attachmentId: string,
    patch: Partial<RunnerTurnAttachment>
  ) {
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
  }

  function applyAttachmentStatePatch(
    attachmentId: string,
    patch: Partial<LocalAttachment> & Partial<RunnerTurnAttachment>
  ) {
    setAttachments((prev) =>
      prev.map((entry) =>
        entry.id === attachmentId
          ? {
              ...entry,
              ...patch,
            }
          : entry
      )
    );
    updateTurnAttachmentState(attachmentId, patch);
  }

  async function ensureGithubSelectionPrepared(
    attachment: LocalAttachment,
    targetEnvironmentId: string
  ): Promise<RunnerAttachment> {
    if (!attachment.resolvedAttachment) {
      throw new Error("Missing GitHub attachment metadata.");
    }

    const repoFullName = String(attachment.githubRepoFullName || "").trim();
    const branch = String(attachment.githubRef || "").trim() || "main";
    if (!repoFullName) {
      throw new Error("Missing GitHub repository metadata.");
    }

    if (!normalizedBackendUrl || !apiKey.trim()) {
      return attachment.resolvedAttachment;
    }

    const preparationKey = `${targetEnvironmentId}\u0000${repoFullName}\u0000${branch}`;
    let preparationPromise = githubPreparationPromisesRef.current[preparationKey];
    if (!preparationPromise) {
      preparationPromise = (async () => {
        await startEnvironment({
          backendUrl: normalizedBackendUrl,
          apiKey: apiKey.trim(),
          requestHeaders,
          environmentId: targetEnvironmentId,
          ...(selectedAgentId ? { agentId: selectedAgentId } : {}),
          force: true,
        });
        await prepareGithubRepositorySelection({
          backendUrl: normalizedBackendUrl,
          apiKey: apiKey.trim(),
          requestHeaders,
          environmentId: targetEnvironmentId,
          repoFullName,
          branch,
        });
      })().finally(() => {
        delete githubPreparationPromisesRef.current[preparationKey];
      });
      githubPreparationPromisesRef.current[preparationKey] = preparationPromise;
    }

    await preparationPromise;
    return attachment.resolvedAttachment;
  }

  async function prepareGithubRepoForThreadRun(
    repoSelection: {
      repoFullName: string;
      branch: string;
    },
    targetEnvironmentId: string
  ): Promise<void> {
    const repoFullName = String(repoSelection?.repoFullName || "").trim();
    const branch = String(repoSelection?.branch || "").trim() || "main";
    if (!repoFullName || !targetEnvironmentId || !normalizedBackendUrl || !apiKey.trim()) {
      return;
    }

    const preparationKey = `${targetEnvironmentId}\u0000${repoFullName}\u0000${branch}`;
    let preparationPromise = githubPreparationPromisesRef.current[preparationKey];
    if (!preparationPromise) {
      preparationPromise = prepareGithubRepositorySelection({
        backendUrl: normalizedBackendUrl,
        apiKey: apiKey.trim(),
        requestHeaders,
        environmentId: targetEnvironmentId,
        repoFullName,
        branch,
      }).finally(() => {
        delete githubPreparationPromisesRef.current[preparationKey];
      });
      githubPreparationPromisesRef.current[preparationKey] = preparationPromise;
    }

    await preparationPromise;
  }

  async function resolveSingleAttachment(
    attachment: LocalAttachment,
    environmentIdOverride?: string | null
  ): Promise<RunnerAttachment> {
    if (attachment.integrationSource === "github") {
      const targetEnvironmentId =
        environmentIdOverride === undefined
          ? resolveAttachmentUploadEnvironmentId()
          : environmentIdOverride;
      if (!targetEnvironmentId) {
        throw new Error("Select an environment before attaching GitHub repositories.");
      }
      return ensureGithubSelectionPrepared(attachment, targetEnvironmentId);
    }

    if (attachment.resolvedAttachment) {
      return attachment.resolvedAttachment;
    }

    if (uploadFiles) {
      const uploaded = await uploadFiles([attachment.file]);
      const uploadedAttachment = uploaded[0];
      if (!uploadedAttachment) {
        throw new Error(`Failed to upload ${attachment.file.name}.`);
      }
      return uploadedAttachment;
    }

    if (mapFileToAttachment) {
      return mapFileToAttachment(attachment.file);
    }

    if (normalizedBackendUrl && apiKey.trim()) {
      return uploadAttachment({
        backendUrl: normalizedBackendUrl,
        apiKey: apiKey.trim(),
        requestHeaders,
        file: attachment.file,
        ...(environmentIdOverride ? { environmentId: environmentIdOverride } : {}),
      });
    }

    return defaultAttachmentFromFile(attachment.file);
  }

  function beginAttachmentUpload(
    attachment: LocalAttachment,
    options?: { environmentIdOverride?: string | null }
  ): Promise<RunnerAttachment> | undefined {
    if (attachment.resolvedAttachment && attachment.integrationSource !== "github") {
      return Promise.resolve(attachment.resolvedAttachment);
    }

    if (attachment.integrationSource === "github" && attachment.resolvedAttachment && attachment.uploadStatus === "uploaded") {
      return Promise.resolve(attachment.resolvedAttachment);
    }

    const existingPromise = attachmentUploadPromisesRef.current[attachment.id];
    if (existingPromise) {
      return existingPromise;
    }

    const uploadPromise = resolveSingleAttachment(
      attachment,
      options?.environmentIdOverride === undefined ? resolveAttachmentUploadEnvironmentId() : options.environmentIdOverride
    )
      .then((resolvedAttachment) => {
        attachment.resolvedAttachment = resolvedAttachment;
        attachment.uploadStatus = "uploaded";
        attachment.uploadError = null;
        applyAttachmentStatePatch(attachment.id, {
          resolvedAttachment,
          uploadStatus: "uploaded",
          uploadError: null,
        });
        return resolvedAttachment;
      })
      .catch((error) => {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        attachment.uploadStatus = "failed";
        attachment.uploadError = normalizedError.message || `Failed to upload ${attachment.file.name}.`;
        applyAttachmentStatePatch(attachment.id, {
          uploadStatus: "failed",
          uploadError: normalizedError.message || `Failed to upload ${attachment.file.name}.`,
        });
        throw normalizedError;
      })
      .finally(() => {
        delete attachmentUploadPromisesRef.current[attachment.id];
      });

    attachmentUploadPromisesRef.current[attachment.id] = uploadPromise;
    attachment.uploadStatus = "uploading";
    attachment.uploadError = null;
    applyAttachmentStatePatch(attachment.id, {
      uploadStatus: "uploading",
      uploadError: null,
    });

    return uploadPromise;
  }

  function appendFiles(files: File[]) {
    if (!files.length) return;

    const remainingCapacity = Math.max(maxAttachments - attachmentsRef.current.length, 0);
    const incoming = files.slice(0, remainingCapacity).map((file) => ({
      id: generateId("local"),
      file,
      type: attachmentTypeForFile(file.type, file.name),
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      source: "local" as const,
      uploadStatus:
        uploadFiles || mapFileToAttachment || (normalizedBackendUrl && apiKey.trim())
          ? ("uploading" as const)
          : ("idle" as const),
      uploadError: null,
    }));
    if (!incoming.length) {
      return;
    }

    setAttachments((prev) => [...prev, ...incoming]);

    for (const attachment of incoming) {
      if (attachment.uploadStatus === "uploading") {
        const uploadPromise = beginAttachmentUpload(attachment);
        if (uploadPromise) {
          void uploadPromise.catch(() => undefined);
        }
      }
    }
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

  function removeAttachment(id: string) {
    setAttachments((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        revokeAttachmentPreview(target);
      }
      delete attachmentUploadPromisesRef.current[id];
      return prev.filter((item) => item.id !== id);
    });
  }

  function closeAllInputPopups(mode: "default" | "outside" = "default") {
    const hasStackedPlusPopupsOpen =
      renderedSidePopup !== null &&
      (renderedMainPopup === "main" || isPlusPopupId(activeInputPopup));

    if (mode === "outside" && hasStackedPlusPopupsOpen) {
      setSidePopupExitDirection("down");
    }
    setActiveInputPopup(null);
    setSelectedWorkspaceFileIds([]);
    setIsDraggingOver(false);
    setIsScreenFileDragActive(false);
    clearQuotedSelectionPopup();
  }

  useEffect(() => {
    if (!activeInputPopup) return;
    emitRunnerComposerPopupOpen(composerPopupSourceIdRef.current);
  }, [activeInputPopup]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleComposerPopupOpen = (event: Event) => {
      const sourceId = getRunnerComposerPopupEventSource(event);
      if (!sourceId || sourceId === composerPopupSourceIdRef.current) {
        return;
      }
      closeAllInputPopups();
    };

    window.addEventListener(RUNNER_COMPOSER_POPUP_OPEN_EVENT, handleComposerPopupOpen);
    return () => window.removeEventListener(RUNNER_COMPOSER_POPUP_OPEN_EVENT, handleComposerPopupOpen);
  }, [activeInputPopup, renderedMainPopup, renderedSidePopup]);

  function isExternalFileDrag(event: { dataTransfer?: DataTransfer | null }): boolean {
    const types = event.dataTransfer?.types;
    if (!types) {
      return false;
    }
    return Array.from(types).includes("Files");
  }

  function handleRootFileDragEnter(event: ReactDragEvent<HTMLDivElement>) {
    if (!isExternalFileDrag(event)) {
      return;
    }
    event.preventDefault();
    if (!screenFileDragActiveRef.current) {
      screenFileDragActiveRef.current = true;
      setIsScreenFileDragActive(true);
    }
  }

  function handleRootFileDragOver(event: ReactDragEvent<HTMLDivElement>) {
    if (!isExternalFileDrag(event)) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
    if (!screenFileDragActiveRef.current) {
      screenFileDragActiveRef.current = true;
      setIsScreenFileDragActive(true);
    }
  }

  function handleRootFileDragLeave(event: ReactDragEvent<HTMLDivElement>) {
    if (!isExternalFileDrag(event)) {
      return;
    }
    const rootElement = rootRef.current;
    if (!rootElement) {
      screenFileDragActiveRef.current = false;
      setIsScreenFileDragActive(false);
      return;
    }
    const bounds = rootElement.getBoundingClientRect();
    const hasLeftRoot =
      event.clientX < bounds.left
      || event.clientX > bounds.right
      || event.clientY < bounds.top
      || event.clientY > bounds.bottom;
    if (hasLeftRoot) {
      screenFileDragActiveRef.current = false;
      setIsScreenFileDragActive(false);
    }
  }

  function handleRootFileDrop(event: ReactDragEvent<HTMLDivElement>) {
    if (!isExternalFileDrag(event)) {
      return;
    }
    event.preventDefault();
    screenFileDragActiveRef.current = false;
    setIsScreenFileDragActive(false);
    handleDroppedLocalFiles(Array.from(event.dataTransfer.files || []));
  }

  async function createWorkspaceAttachment(item: RunnerChatFileNode, sourceEnvironmentId: string): Promise<LocalAttachment> {
    const workspacePath = normalizeRunnerPreviewWorkspacePath(item.path || item.id);
    if (!workspacePath) {
      throw new Error(`Failed to prepare ${item.name} for attachment.`);
    }

    const filename = String(item.name || workspacePath.split("/").filter(Boolean).pop() || "file").trim() || "file";
    const previewAttachment = buildRunnerPreviewAttachmentFromPath(workspacePath, {
      backendUrl: normalizedBackendUrl,
      environmentId: sourceEnvironmentId,
      idPrefix: "workspace",
    });
    const mimeType = String(item.mimeType || previewAttachment.mimeType || "application/octet-stream").trim() || "application/octet-stream";
    const type = attachmentTypeForFile(mimeType, filename);
    const resolvedAttachment: RunnerAttachment = {
      ...previewAttachment,
      id: previewAttachment.id,
      filename,
      mimeType,
      size: typeof item.size === "number" && Number.isFinite(item.size) ? item.size : 0,
      type,
      uploadedAt: String(item.modifiedTime || item.createdTime || new Date().toISOString()),
      workspacePath,
      sourcePath: workspacePath,
      sourceEnvironmentId,
    };
    const file = new File([""], filename, { type: mimeType });

    return {
      id: generateId("workspace"),
      file,
      type,
      previewUrl: type === "image" ? previewAttachment.previewUrl || previewAttachment.url : undefined,
      source: "workspace",
      sourceEnvironmentId,
      resolvedAttachment,
      uploadStatus: "uploaded",
      uploadError: null,
    };
  }

  async function createImplicitAttachment(item: RunnerChatImplicitAttachment): Promise<LocalAttachment> {
    const sourceUrl = String(item.url || "").trim();
    const filename = String(item.filename || "").trim() || "attachment";
    if (!sourceUrl) {
      throw new Error(`Failed to prepare ${filename}: missing attachment URL.`);
    }

    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename} (${response.status}).`);
    }

    const blob = await response.blob();
    const mimeType = String(item.mimeType || blob.type || "application/octet-stream").trim() || "application/octet-stream";
    const file = new File([blob], filename, { type: mimeType });
    const type =
      item.type === "image" || item.type === "document"
        ? item.type
        : attachmentTypeForFile(mimeType, filename);

    return {
      id: generateId("implicit"),
      file,
      type,
      previewUrl: type === "image" ? sourceUrl : undefined,
      source: "local",
      hiddenFromTurnDisplay: Boolean(item.hiddenFromTurnDisplay),
      runnerAttachmentRole: item.runnerAttachmentRole,
      uploadStatus: "idle",
      uploadError: null,
    };
  }

  async function createImplicitRunAttachments(): Promise<LocalAttachment[]> {
    const normalizedImplicitAttachments = implicitAttachments
      .filter((attachment) => attachment && String(attachment.url || "").trim())
      .map((attachment) => ({
        ...attachment,
        filename: String(attachment.filename || "").trim() || "attachment",
      }));

    if (!normalizedImplicitAttachments.length) {
      return [];
    }

    const preparedAttachments = await Promise.all(
      normalizedImplicitAttachments.map((attachment) => createImplicitAttachment(attachment))
    );
    return preparedAttachments;
  }

  async function createIntegrationAttachment(
    item: RunnerChatFileNode,
    source: "google-drive" | "one-drive" | "github",
    targetEnvironmentId: string,
    fetchFileContent: (file: RunnerChatFileNode) => Promise<RunnerChatFetchedFileContent>
  ): Promise<LocalAttachment> {
    const payload = await fetchFileContent(item);
    const filename = String(payload?.name || item.name || "file").trim() || "file";
    const mimeType = String(payload?.mimeType || item.mimeType || "application/octet-stream").trim() || "application/octet-stream";
    const type = attachmentTypeForFile(mimeType, filename);
    const encodedData =
      payload?.encoding === "text"
        ? await blobToBase64(new Blob([typeof payload?.content === "string" ? payload.content : ""], { type: mimeType }))
        : normalizeBase64Content(typeof payload?.content === "string" ? payload.content : "");
    const resolvedAttachment = await uploadAttachmentContent({
      backendUrl: normalizedBackendUrl,
      apiKey: apiKey.trim(),
      requestHeaders,
      filename,
      mimeType,
      data: encodedData,
      environmentId: targetEnvironmentId,
    });
    const file = new File([""], filename, { type: mimeType });
    const resolvedImagePreviewUrl =
      payload?.encoding === "text"
        ? undefined
        : encodedData
          ? `data:${mimeType};base64,${encodedData}`
          : item.previewUrl;
    const previewUrl = type === "image" ? resolvedImagePreviewUrl : undefined;

    return {
      id: generateId("integration"),
      file,
      type,
      previewUrl,
      source: "integration",
      sourceEnvironmentId: targetEnvironmentId,
      integrationSource: source,
      githubRepoFullName: source === "github" ? item.repoFullName : undefined,
      githubRef: source === "github" ? item.ref || null : undefined,
      resolvedAttachment,
      uploadStatus: "uploaded",
      uploadError: null,
    };
  }

  function createGithubIntegrationSelectionAttachment(
    item: RunnerChatFileNode,
    targetEnvironmentId: string,
    options?: { pendingPreparation?: boolean }
  ): LocalAttachment {
    const repoFullName = String(item.repoFullName || "").trim();
    if (!repoFullName) {
      throw new Error("Missing GitHub repository metadata.");
    }

    const repoName = getGithubRepoName(repoFullName);
    const selectedBranch = getGithubSelectedBranchForRepo(repoFullName, item.ref);
    const normalizedItemPath = String(item.path || "").trim().replace(/^\/+/, "");
    const selectionType: "repo" | "file" = item.isFolder && !normalizedItemPath ? "repo" : "file";
    const displayName =
      selectionType === "repo"
        ? repoName
        : `${repoName}/${(normalizedItemPath.split("/").filter(Boolean).pop() || item.name || "file").trim()}`;
    const workspacePath = `/workspace/GitHub/${repoName}${normalizedItemPath ? `/${normalizedItemPath}` : ""}`;
    const selectionMimeType = "application/x-github-selection";
    const file = new File([""], displayName, { type: selectionMimeType });
    const resolvedAttachment: RunnerAttachment = {
      id: generateId("integration"),
      filename: displayName,
      mimeType: selectionMimeType,
      size: 0,
      type: "document",
      uploadedAt: new Date().toISOString(),
      url: "",
      gcsPath: "",
      workspacePath,
      integrationSource: "github",
      githubRepoFullName: repoFullName,
      githubRef: selectedBranch,
      githubItemPath: normalizedItemPath || undefined,
      githubSelectionType: selectionType,
    };

    return {
      id: generateId("integration"),
      file,
      type: "document",
      source: "integration",
      sourceEnvironmentId: targetEnvironmentId,
      integrationSource: "github",
      githubRepoFullName: repoFullName,
      githubRef: selectedBranch,
      githubItemPath: normalizedItemPath || undefined,
      githubSelectionType: selectionType,
      resolvedAttachment,
      uploadStatus: options?.pendingPreparation ? "uploading" : "uploaded",
      uploadError: null,
    };
  }

  function handleAttachFilesMenuClick() {
    setActiveInputPopup("attach-files");
  }

  function closeAttachFilesPopup() {
    setIsDraggingOver(false);
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

  function clearScheduledTask() {
    setScheduledTask(null);
  }

  function handleUploadNewFilesClick() {
    fileInputRef.current?.click();
  }

  function openFileBrowserModal(initialSource: RunnerFileBrowserSource) {
    if (!hasApiKey) {
      setShowFileBrowserApiKeyPrompt(true);
      return;
    }
    setActiveInputPopup(null);
    setFileBrowserSource(initialSource);
    setFileBrowserSearchQuery("");
    setFileBrowserPreviewId(null);
    setExpandedFileBrowserFolderIds([]);
    if (initialSource === "workspace") {
      setRemoteWorkspaceItems([]);
      setLoadedWorkspaceFolderIds([]);
      setLoadingWorkspaceFolderIds([]);
      setWorkspaceFolderErrorsById({});
      setWorkspaceBrowserError(null);
    } else if (initialSource === "google-drive") {
      setRemoteGoogleDriveItems([]);
      setLoadedGoogleDriveFolderIds([]);
      setLoadingGoogleDriveFolderIds([]);
      setGoogleDriveBrowserError(null);
    } else if (initialSource === "one-drive") {
      setRemoteOneDriveItems([]);
      setLoadedOneDriveFolderIds([]);
      setLoadingOneDriveFolderIds([]);
      setOneDriveBrowserError(null);
    } else if (initialSource === "github") {
      setRemoteGithubItems([]);
      setLoadedGithubFolderIds([]);
      setLoadingGithubFolderIds([]);
      setGithubBrowserError(null);
    } else if (initialSource === "notion") {
      setRemoteNotionDatabases([]);
      setNotionDatabasesLoaded(false);
      setNotionBrowserError(null);
    }
    setFileBrowserHistory([{ source: initialSource, folderId: null }]);
    setFileBrowserHistoryIndex(0);
    setShowFileBrowserModal(true);
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
    setShowFileBrowserModal(false);
    setFileBrowserSearchQuery("");
    setFileBrowserPreviewId(null);
    setExpandedFileBrowserFolderIds([]);
    setIsFileBrowserAttaching(false);
    setFileBrowserHistory([]);
    setFileBrowserHistoryIndex(-1);
    setRemoteWorkspaceItems([]);
    setLoadedWorkspaceFolderIds([]);
    setLoadingWorkspaceFolderIds([]);
    setWorkspaceFolderErrorsById({});
    setWorkspaceBrowserError(null);
    setGoogleDriveBrowserError(null);
    setOneDriveBrowserError(null);
    setGithubBrowserError(null);
    setIsGoogleDrivePickerLoading(false);
  }

  function closeFileBrowserApiKeyPrompt() {
    setShowFileBrowserApiKeyPrompt(false);
  }

  async function loadWorkspaceFolder(folderId: string | null, options?: { inline?: boolean }) {
    const normalizedFolderId = normalizeRunnerWorkspaceFolderPath(folderId) || "root";
    const requestedFolderPath = normalizedFolderId === "root" ? "" : normalizedFolderId;
    const requestUrl = buildEnvironmentFileListUrl(normalizedBackendUrl, activeWorkspaceEnvironmentId || "", requestedFolderPath, 1);
    if (!requestUrl) {
      setRemoteWorkspaceItems([]);
      setWorkspaceBrowserError("Select an environment to browse workspace files.");
      setIsWorkspaceBrowserLoading(false);
      return;
    }

    if (options?.inline) {
      setLoadingWorkspaceFolderIds((current) => (current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId]));
    } else {
      setIsWorkspaceBrowserLoading(true);
      setWorkspaceBrowserError(null);
    }
    setWorkspaceFolderErrorsById((current) => ({
      ...current,
      [normalizedFolderId]: "",
    }));

    try {
      const headers = buildRunnerHeaders(requestHeaders, apiKey.trim());
      const response = await fetch(requestUrl, {
        method: "GET",
        headers,
      });
      const text = await response.text();
      let parsed: any = {};
      try {
        parsed = text ? JSON.parse(text) : {};
      } catch {
        parsed = { message: text };
      }

      if (!response.ok) {
        throw new Error(parsed?.message || parsed?.error || `Failed to load workspace files (${response.status})`);
      }

      const nextItems = normalizeEnvironmentWorkspaceItems(parsed);
      setRemoteWorkspaceItems((current) => mergeDriveFolderItems(current, normalizedFolderId, nextItems));
      setLoadedWorkspaceFolderIds((current) => (current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId]));
      setWorkspaceFolderErrorsById((current) => ({
        ...current,
        [normalizedFolderId]: "",
      }));
      if (!options?.inline) {
        setWorkspaceBrowserError(null);
      }
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      const message = normalizedError.message || "Failed to load workspace files.";
      setWorkspaceFolderErrorsById((current) => ({
        ...current,
        [normalizedFolderId]: message,
      }));
      if (normalizedFolderId === "root" || !options?.inline) {
        setRemoteWorkspaceItems([]);
        setWorkspaceBrowserError(message);
      }
    } finally {
      if (options?.inline) {
        setLoadingWorkspaceFolderIds((current) => current.filter((id) => id !== normalizedFolderId));
      } else {
        setIsWorkspaceBrowserLoading(false);
      }
    }
  }

  async function loadGoogleDriveFolder(folderId: string, options?: { inline?: boolean }) {
    if (!googleDriveConfig?.fetchItems) {
      return;
    }

    const normalizedFolderId = folderId || "root";
    if (options?.inline) {
      setLoadingGoogleDriveFolderIds((current) => (current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId]));
    } else {
      setIsGoogleDriveBrowserLoading(true);
      setGoogleDriveBrowserError(null);
    }

    try {
      const items = await googleDriveConfig.fetchItems(normalizedFolderId);
      setRemoteGoogleDriveItems((current) => mergeDriveFolderItems(current, normalizedFolderId, items));
      setLoadedGoogleDriveFolderIds((current) => (current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId]));
      setGoogleDriveBrowserError(null);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setGoogleDriveBrowserError(normalizedError.message || "Failed to load Google Drive files.");
    } finally {
      if (options?.inline) {
        setLoadingGoogleDriveFolderIds((current) => current.filter((id) => id !== normalizedFolderId));
      } else {
        setIsGoogleDriveBrowserLoading(false);
      }
    }
  }

  async function loadOneDriveFolder(folderId: string, options?: { inline?: boolean }) {
    if (!oneDriveConfig?.fetchItems) {
      return;
    }

    const normalizedFolderId = folderId || "root";
    if (options?.inline) {
      setLoadingOneDriveFolderIds((current) => (current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId]));
    } else {
      setIsOneDriveBrowserLoading(true);
      setOneDriveBrowserError(null);
    }

    try {
      const items = await oneDriveConfig.fetchItems(normalizedFolderId);
      setRemoteOneDriveItems((current) => mergeDriveFolderItems(current, normalizedFolderId, items));
      setLoadedOneDriveFolderIds((current) => (current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId]));
      setOneDriveBrowserError(null);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setOneDriveBrowserError(normalizedError.message || "Failed to load OneDrive files.");
    } finally {
      if (options?.inline) {
        setLoadingOneDriveFolderIds((current) => current.filter((id) => id !== normalizedFolderId));
      } else {
        setIsOneDriveBrowserLoading(false);
      }
    }
  }

  async function loadGithubFolder(folderId: string, options?: { inline?: boolean }) {
    if (!githubConfig?.fetchItems) {
      return;
    }

    const normalizedFolderId = folderId || "root";
    if (options?.inline) {
      setLoadingGithubFolderIds((current) => (current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId]));
    } else {
      setIsGithubBrowserLoading(true);
      setGithubBrowserError(null);
    }

    try {
      const items = await githubConfig.fetchItems(normalizedFolderId);
      const normalizedItems =
        normalizedFolderId === "root"
          ? items.map((item) => buildGithubEffectiveRootItem(item))
          : items;
      setRemoteGithubItems((current) => mergeDriveFolderItems(current, normalizedFolderId, normalizedItems));
      setLoadedGithubFolderIds((current) => (current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId]));
      setGithubBrowserError(null);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setGithubBrowserError(normalizedError.message || "Failed to load GitHub files.");
    } finally {
      if (options?.inline) {
        setLoadingGithubFolderIds((current) => current.filter((id) => id !== normalizedFolderId));
      } else {
        setIsGithubBrowserLoading(false);
      }
    }
  }

  async function ensureGithubBranchesLoaded(repoFullName: string, fallbackRef?: string | null) {
    const normalizedRepoFullName = String(repoFullName || "").trim();
    if (!normalizedRepoFullName) {
      return;
    }

    const initialBranch = getGithubSelectedBranchForRepo(normalizedRepoFullName, fallbackRef);
    if (initialBranch) {
      setGithubSelectedBranchByRepoFullName((current) =>
        current[normalizedRepoFullName]
          ? current
          : {
              ...current,
              [normalizedRepoFullName]: initialBranch,
            }
      );
    }

    if (
      githubBranchesByRepoFullName[normalizedRepoFullName]?.length
      || githubBranchLoadingRepoFullNames.includes(normalizedRepoFullName)
      || !githubConfig?.fetchBranches
    ) {
      return;
    }

    setGithubBranchLoadingRepoFullNames((current) =>
      current.includes(normalizedRepoFullName) ? current : [...current, normalizedRepoFullName]
    );

    try {
      const branches = await githubConfig.fetchBranches(normalizedRepoFullName);
      setGithubBranchesByRepoFullName((current) => ({
        ...current,
        [normalizedRepoFullName]: branches,
      }));
      if (branches.length > 0) {
        setGithubSelectedBranchByRepoFullName((current) =>
          current[normalizedRepoFullName]
            ? current
            : {
                ...current,
                [normalizedRepoFullName]: String(branches[0]?.name || initialBranch || "main").trim() || "main",
              }
        );
      }
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setGithubBrowserError(normalizedError.message || "Failed to load GitHub branches.");
    } finally {
      setGithubBranchLoadingRepoFullNames((current) => current.filter((name) => name !== normalizedRepoFullName));
    }
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
    setFileBrowserHistory((current) =>
      current.map((entry) => {
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
      })
    );

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
      setFileBrowserHistory([{ source: "google-drive", folderId: null }]);
      setFileBrowserHistoryIndex(0);
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

  function toggleMainMenu() {
    setActiveInputPopup((current) => (isPlusPopupId(current) ? null : "main"));
  }

  function openPlusPopup(popup: Exclude<InputPopupId, "context" | "agent" | "agent-reasoning" | "environment">) {
    setActiveInputPopup(popup);
  }

  function togglePopup(popup: InputPopupId) {
    setActiveInputPopup((current) => (current === popup ? null : popup));
  }

  function toggleSkill(skillId: string) {
    const normalizedSkillId = normalizeRunnerSkillId(skillId);
    if (!normalizedSkillId) {
      return;
    }
    setEnabledSkillIds((current) => {
      const next = current.includes(normalizedSkillId) ? current.filter((id) => id !== normalizedSkillId) : [...current, normalizedSkillId];
      onSkillsChange?.(next);
      return next;
    });
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
    const project = availableProjects.find((entry) => entry.id === nextProjectId) || null;
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

  function selectGithubRepository(nextRepositoryId: string) {
    setSelectedGithubRepositoryId(nextRepositoryId);
    githubConfig?.onRepositoryChange?.(nextRepositoryId);
  }

  function selectGithubContext(nextContextId: string) {
    setSelectedGithubContextId(nextContextId);
    githubConfig?.onContextChange?.(nextContextId);
  }

  function selectNotionDatabase(nextDatabaseId: string) {
    setSelectedNotionDatabaseId(nextDatabaseId);
    notionConfig?.onDatabaseChange?.(nextDatabaseId);
  }

  function toggleFileSelection(selection: string[], nextId: string): string[] {
    return selection.includes(nextId) ? selection.filter((id) => id !== nextId) : [...selection, nextId];
  }

  function handleWorkspaceFileBrowserEnvironmentSelect(nextEnvironmentId: string) {
    setSelectedWorkspaceFileIds([]);
    pruneWorkspaceAttachmentsForEnvironment(nextEnvironmentId);
    setSelectedEnvironmentId(nextEnvironmentId);
    onEnvironmentChange?.(nextEnvironmentId);
    switchFileBrowserSource("workspace");
  }

  async function attachWorkspaceFiles(): Promise<boolean> {
    const selectedItems = workspaceItems.filter((item) => selectedWorkspaceFileIds.includes(item.id) && !item.isFolder);
    if (!selectedItems.length) {
      return false;
    }

    if (!activeWorkspaceEnvironmentId) {
      setWorkspaceBrowserError("Select an environment to browse workspace files.");
      return false;
    }

    const remainingCapacity = Math.max(maxAttachments - attachments.length, 0);
    const itemsToAttach = selectedItems.slice(0, remainingCapacity);
    if (!itemsToAttach.length) {
      return false;
    }

    setInlineError(null);
    setIsFileBrowserAttaching(true);

    try {
      const createdAttachments = await Promise.all(
        itemsToAttach.map((item) => createWorkspaceAttachment(item, activeWorkspaceEnvironmentId))
      );
      setAttachments((prev) => [...prev, ...createdAttachments]);
      workspaceConfig?.onAttach?.(itemsToAttach.map((item) => item.id));
      setSelectedWorkspaceFileIds([]);
      closeAllInputPopups();
      return true;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setInlineError(normalizedError.message || "Failed to attach workspace files.");
      return false;
    } finally {
      setIsFileBrowserAttaching(false);
    }
  }

  async function attachIntegrationFiles(source: "google-drive" | "one-drive" | "github"): Promise<boolean> {
    const config =
      source === "google-drive"
        ? googleDriveConfig
        : source === "one-drive"
          ? oneDriveConfig
          : githubConfig;
    const items =
      source === "google-drive"
        ? googleDriveItems
        : source === "one-drive"
          ? oneDriveItems
          : githubItems;
    const selectedIds =
      source === "google-drive"
        ? selectedGoogleDriveFileIds
        : source === "one-drive"
          ? selectedOneDriveFileIds
          : selectedGithubFileIds;
    const selectedItems = items.filter((item) => selectedIds.includes(item.id) && (source === "github" || !item.isFolder));
    if (!selectedItems.length) {
      return false;
    }

    const targetEnvironmentId = resolveAttachmentUploadEnvironmentId();
    if (!targetEnvironmentId) {
      setInlineError("Select an environment before attaching files.");
      return false;
    }
    const fetchFileContent = config?.fetchFileContent;
    if (source !== "github" && !fetchFileContent) {
      setInlineError("This integration does not support file downloads.");
      return false;
    }

    if (source === "github") {
      const selectedRepoFullNames = Array.from(
        new Set(
          selectedItems
            .map((item) => String(item.repoFullName || "").trim())
            .filter(Boolean)
        )
      );
      if (selectedRepoFullNames.length > 1) {
        setInlineError("Attach files from a single GitHub repository per message.");
        return false;
      }
    }

    const remainingCapacity = Math.max(maxAttachments - attachments.length, 0);
    const itemsToAttach = selectedItems.slice(0, remainingCapacity);
    if (!itemsToAttach.length) {
      return false;
    }

    setInlineError(null);
    setIsFileBrowserAttaching(true);

    try {
      const createdAttachments =
        source === "github"
          ? itemsToAttach.map((item) =>
              createGithubIntegrationSelectionAttachment(item, targetEnvironmentId, {
                pendingPreparation: Boolean(normalizedBackendUrl && apiKey.trim()),
              })
            )
          : await Promise.all(
              itemsToAttach.map((item) =>
                createIntegrationAttachment(item, source, targetEnvironmentId, fetchFileContent!)
              )
            );
      setAttachments((prev) => [...prev, ...createdAttachments]);
      if (source === "github") {
        for (const attachment of createdAttachments) {
          const uploadPromise = beginAttachmentUpload(attachment, { environmentIdOverride: targetEnvironmentId });
          if (uploadPromise) {
            void uploadPromise.catch((error) => {
              const normalizedError = error instanceof Error ? error : new Error(String(error));
              setInlineError(normalizedError.message || "Failed to prepare GitHub repository.");
            });
          }
        }
      }
      config?.onAttach?.(itemsToAttach.map((item) => item.id));
      if (source === "google-drive") {
        setSelectedGoogleDriveFileIds([]);
      } else if (source === "one-drive") {
        setSelectedOneDriveFileIds([]);
      } else {
        setSelectedGithubFileIds([]);
      }
      closeAllInputPopups();
      return true;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setInlineError(normalizedError.message || "Failed to attach files.");
      return false;
    } finally {
      setIsFileBrowserAttaching(false);
    }
  }

  function switchFileBrowserSource(nextSource: RunnerFileBrowserSource) {
    setFileBrowserSource(nextSource);
    setFileBrowserPreviewId(null);
    setFileBrowserSearchQuery("");
    setExpandedFileBrowserFolderIds([]);
    if (nextSource === "workspace") {
      setRemoteWorkspaceItems([]);
      setLoadedWorkspaceFolderIds([]);
      setLoadingWorkspaceFolderIds([]);
      setWorkspaceFolderErrorsById({});
      setWorkspaceBrowserError(null);
    } else if (nextSource === "google-drive") {
      setRemoteGoogleDriveItems([]);
      setLoadedGoogleDriveFolderIds([]);
      setLoadingGoogleDriveFolderIds([]);
      setGoogleDriveBrowserError(null);
    } else if (nextSource === "one-drive") {
      setRemoteOneDriveItems([]);
      setLoadedOneDriveFolderIds([]);
      setLoadingOneDriveFolderIds([]);
      setOneDriveBrowserError(null);
    } else if (nextSource === "github") {
      setRemoteGithubItems([]);
      setLoadedGithubFolderIds([]);
      setLoadingGithubFolderIds([]);
      setGithubBrowserError(null);
    } else if (nextSource === "notion") {
      setRemoteNotionDatabases([]);
      setNotionDatabasesLoaded(false);
      setNotionBrowserError(null);
    }
    setFileBrowserHistory([{ source: nextSource, folderId: null }]);
    setFileBrowserHistoryIndex(0);
  }

  function navigateFileBrowserToFolder(folderId: string | null) {
    if (fileBrowserSearchQuery.trim()) {
      setFileBrowserSearchQuery("");
    }
    const nextEntry = { source: currentFileBrowserSource, folderId };
    setFileBrowserHistory((current) => [...current.slice(0, fileBrowserHistoryIndex + 1), nextEntry]);
    setFileBrowserHistoryIndex((current) => current + 1);
    setFileBrowserPreviewId(null);
    setExpandedFileBrowserFolderIds([]);
  }

  function navigateFileBrowserToBreadcrumb(index: number) {
    const nextEntry = fileBrowserPath[index];
    if (!nextEntry) return;
    navigateFileBrowserToFolder(nextEntry.id);
  }

  function goFileBrowserBack() {
    if (fileBrowserHistoryIndex <= 0) return;
    setFileBrowserHistoryIndex((current) => current - 1);
    setFileBrowserPreviewId(null);
    setExpandedFileBrowserFolderIds([]);
  }

  function goFileBrowserForward() {
    if (fileBrowserHistoryIndex >= fileBrowserHistory.length - 1) return;
    setFileBrowserHistoryIndex((current) => current + 1);
    setFileBrowserPreviewId(null);
    setExpandedFileBrowserFolderIds([]);
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

    if (fileBrowserSearchQuery.trim()) {
      setFileBrowserSearchQuery("");
    }
    setFileBrowserPreviewId(null);
    setExpandedFileBrowserFolderIds([]);

    const nextEntry = { source: currentFileBrowserSource, folderId: normalizedFolderId };
    setFileBrowserHistory((current) => [...current.slice(0, fileBrowserHistoryIndex + 1), nextEntry]);
    setFileBrowserHistoryIndex((current) => current + 1);

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

  function handleFileBrowserItemClick(item: RunnerChatFileNode) {
    setFileBrowserPreviewId(item.id);
    if (item.isFolder) {
      void openFileBrowserFolder(item);
      return;
    }

    if (currentFileBrowserSource === "google-drive") {
      setSelectedGoogleDriveFileIds((current) => toggleFileSelection(current, item.id));
      return;
    }

    if (currentFileBrowserSource === "one-drive") {
      setSelectedOneDriveFileIds((current) => toggleFileSelection(current, item.id));
      return;
    }
    if (currentFileBrowserSource === "github") {
      setSelectedGithubFileIds((current) => toggleFileSelection(current, item.id));
      return;
    }
    if (currentFileBrowserSource === "notion") {
      setSelectedNotionDatabaseId((current) => (current === item.id ? "" : item.id));
      return;
    }

    setSelectedWorkspaceFileIds((current) => toggleFileSelection(current, item.id));
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

  function handleScheduleSubmit() {
    const scheduledTime = new Date(scheduledAtValue);
    if (Number.isNaN(scheduledTime.getTime())) {
      setInlineError("Pick a valid date and time for the schedule.");
      return;
    }
    const selectedPreset = schedulePresets.find((preset) => preset.id === selectedSchedulePresetId);
    const nextSchedule = {
      scheduledTime,
      scheduleType,
      cronExpression: scheduleType === "recurring" ? selectedPreset?.cron : undefined,
    } as const;
    setScheduledTask(nextSchedule);
    scheduleConfig?.onQuickSchedule?.(nextSchedule);
    closeAllInputPopups();
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
    setThreadContextDetailsError(null);
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

  async function resolveAttachmentPayload(
    files: LocalAttachment[],
    environmentIdOverride?: string | null
  ): Promise<RunnerAttachment[] | undefined> {
    if (!files.length) return undefined;

    await Promise.all(
      files
        .map((entry) => attachmentUploadPromisesRef.current[entry.id])
        .filter((uploadPromise): uploadPromise is Promise<RunnerAttachment> => Boolean(uploadPromise))
        .map((uploadPromise) => uploadPromise.catch(() => undefined))
    );

    const resolvedAttachments = files
      .map((entry) => entry.resolvedAttachment)
      .filter((attachment): attachment is RunnerAttachment => Boolean(attachment));
    const unresolvedFiles = files.filter((entry) => !entry.resolvedAttachment);

    if (!unresolvedFiles.length) {
      return resolvedAttachments.length ? resolvedAttachments : undefined;
    }
    const uploadEnvironmentId =
      environmentIdOverride === undefined
        ? resolveAttachmentUploadEnvironmentId()
        : environmentIdOverride;
    const uploaded = await Promise.all(
      unresolvedFiles.map((entry) => beginAttachmentUpload(entry, { environmentIdOverride: uploadEnvironmentId }) || resolveSingleAttachment(entry, uploadEnvironmentId))
    );
    const combined = [...resolvedAttachments, ...uploaded];
    return combined.length ? combined : undefined;
  }

  async function runTask() {
    if (!canRun) return;

    setInlineError(null);
    closeAllInputPopups();
    let ensuredThreadId: string | undefined;

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
      const resourceCreationCommand = stagedResourceCreationCommand;
      const agentCreationCommand = stagedAgentCreationCommand;
      const skillCreationCommand = stagedSkillCreationCommand;
      const slideCreationCommand = stagedSlideCreationCommand;
      const researchCreationCommand = stagedResearchCreationCommand;
      const scrapeCreationCommand = stagedScrapeCreationCommand;
      const parseCreationCommand = stagedParseCreationCommand;
      const adCreationCommand = stagedAdCreationCommand ? buildStagedRunnerAdCreationCommand(adCreationSettings) : null;
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

      const implicitAttachmentEntries = await createImplicitRunAttachments();
      attachmentEntries = implicitAttachmentEntries.length > 0
        ? [...implicitAttachmentEntries, ...composerAttachmentEntries]
        : composerAttachmentEntries;

      if (selectedComposerProjectTask && onComposerProjectTaskSubmit && taskText) {
        setIsPreparingRun(true);
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
        setIsPreparingRun(false);
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
      if (
        executionAttachmentEntries.length === 0 &&
        !quotedSelection &&
        await tryHandleThreadCommunicatorMessage(taskText)
      ) {
        return;
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
      );
      if (
        executionAttachmentEntries.length === 0
        && !(previewImageRunAttachments?.length)
        && !quotedSelection
        && !hasSpecialExecutionCommand
        && await tryHandleActiveCanonicalWorkerInstruction(taskText)
      ) {
        return;
      }
      if (hasRoutableActiveRun) {
        const queuedTurnId = generateId("turn");
        setTurns((prev) => [
          ...prev,
          {
            id: queuedTurnId,
            prompt: taskText,
            logs: [],
            startedAtMs: Date.now(),
            status: "queued",
            animateOnRender: true,
            isInitialTurn: prev.length === 0,
            agentName: selectedAgent?.name || displayedAgentLabel,
            environmentName: selectedEnvironment?.name || displayedEnvironmentLabel,
            quotedSelection,
            attachments: queuedTurnAttachments,
            slideCreationCommand,
            researchCreationCommand,
            scrapeCreationCommand,
            parseCreationCommand,
            adCreationCommand,
          },
        ]);
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
          },
        ]);
        return;
      }

      setIsPreparingRun(true);
        const execution = await executeThreadRun(executionTaskText, executionAttachmentEntries, {
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
          extraResolvedAttachments:
            nextQueuedMessage.extraResolvedAttachments,
          displayPromptOverride: nextQueuedMessage.displayPrompt,
          reasoningEffortOverride: nextQueuedMessage.reasoningEffort,
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
    if (!stagedThreadContextCommand && !stagedResourceCreationCommand && !stagedAgentCreationCommand && !stagedSkillCreationCommand && !stagedSlideCreationCommand && !stagedResearchCreationCommand && !stagedScrapeCreationCommand && !stagedParseCreationCommand && !stagedAdCreationCommand && !stagedBacklogCommand) {
      const autoStageCommand = parseAutoStageThreadContextCommand(nextValue);
      if (autoStageCommand) {
        stageThreadContextCommand(autoStageCommand.action, autoStageCommand.prompt);
        return;
      }
      const autoStageSlideCreationCommand = parseAutoStageSlideCreationCommand(nextValue);
      if (autoStageSlideCreationCommand) {
        stageSlideCreationCommand(autoStageSlideCreationCommand.prompt);
        return;
      }
      const autoStageAdCreationCommand = parseAutoStageAdCreationCommand(nextValue);
      if (autoStageAdCreationCommand) {
        stageAdCreationCommand(autoStageAdCreationCommand.prompt);
        return;
      }
      const autoStageResearchCreationCommand = parseAutoStageResearchCreationCommand(nextValue);
      if (autoStageResearchCreationCommand) {
        stageResearchCreationCommand(autoStageResearchCreationCommand.prompt);
        return;
      }
      const autoStageScrapeCreationCommand = parseAutoStageScrapeCreationCommand(nextValue);
      if (autoStageScrapeCreationCommand) {
        stageScrapeCreationCommand(autoStageScrapeCreationCommand.prompt);
        return;
      }
      const autoStageParseCreationCommand = parseAutoStageParseCreationCommand(nextValue);
      if (autoStageParseCreationCommand) {
        stageParseCreationCommand(autoStageParseCreationCommand.prompt);
        return;
      }
      if (enableResourceCreationCommand) {
        const autoStageResourceCreationCommand = parseAutoStageResourceCreationCommand(nextValue);
        if (autoStageResourceCreationCommand) {
          stageResourceCreationCommand(autoStageResourceCreationCommand.action, autoStageResourceCreationCommand.prompt);
          return;
        }
      }
      if (enableAgentCreationCommand) {
        const autoStageAgentCreationCommand = parseAutoStageAgentCreationCommand(nextValue);
        if (autoStageAgentCreationCommand) {
          stageAgentCreationCommand(autoStageAgentCreationCommand.action, autoStageAgentCreationCommand.prompt);
          return;
        }
      }
      if (enableSkillCreationCommand) {
        const autoStageSkillCreationCommand = parseAutoStageSkillCreationCommand(nextValue);
        if (autoStageSkillCreationCommand) {
          stageSkillCreationCommand(autoStageSkillCreationCommand.action, autoStageSkillCreationCommand.prompt);
          return;
        }
      }
      if (enableBacklogSubtaskCommand) {
        const autoStageBacklogSubtaskCommand = parseAutoStageBacklogSubtaskCommand(nextValue);
        if (autoStageBacklogSubtaskCommand) {
          stageBacklogSubtaskCommand(autoStageBacklogSubtaskCommand.ticketNumber, autoStageBacklogSubtaskCommand.prompt);
          return;
        }
      }
      if (enableBacklogMissionControlCommand) {
        const autoStageBacklogMissionControlCommand = parseAutoStageBacklogMissionControlCommand(nextValue);
        if (autoStageBacklogMissionControlCommand) {
          stageBacklogMissionControlCommand(autoStageBacklogMissionControlCommand.prompt);
          return;
        }
      }
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
    if (event.key === "Backspace" && stagedThreadContextCommand && input.length === 0) {
      event.preventDefault();
      setStagedThreadContextCommand(null);
      return;
    }
    if (event.key === "Backspace" && stagedResourceCreationCommand && input.length === 0) {
      event.preventDefault();
      setStagedResourceCreationCommand(null);
      return;
    }
    if (event.key === "Backspace" && stagedAgentCreationCommand && input.length === 0) {
      event.preventDefault();
      setStagedAgentCreationCommand(null);
      return;
    }
    if (event.key === "Backspace" && stagedSkillCreationCommand && input.length === 0) {
      event.preventDefault();
      setStagedSkillCreationCommand(null);
      return;
    }
    if (event.key === "Backspace" && stagedSlideCreationCommand && input.length === 0) {
      event.preventDefault();
      setStagedSlideCreationCommand(null);
      return;
    }
    if (event.key === "Backspace" && stagedResearchCreationCommand && input.length === 0) {
      event.preventDefault();
      setStagedResearchCreationCommand(null);
      return;
    }
    if (event.key === "Backspace" && stagedScrapeCreationCommand && input.length === 0) {
      event.preventDefault();
      setStagedScrapeCreationCommand(null);
      return;
    }
    if (event.key === "Backspace" && stagedParseCreationCommand && input.length === 0) {
      event.preventDefault();
      setStagedParseCreationCommand(null);
      return;
    }
    if (event.key === "Backspace" && stagedAdCreationCommand && input.length === 0) {
      event.preventDefault();
      setStagedAdCreationCommand(null);
      return;
    }
    if (event.key === "Backspace" && stagedBacklogSubtaskCommand && input.length === 0) {
      event.preventDefault();
      setStagedBacklogSubtaskCommand(null);
      return;
    }
    if (event.key === "Backspace" && stagedBacklogMissionControlCommand && input.length === 0) {
      event.preventDefault();
      setStagedBacklogMissionControlCommand(null);
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

  function renderNestedTimelineItems(turn: RunnerTurn, items: RunnerTimelineItem[], options?: { renderBrowserSkillAsGeneric?: boolean }) {
    return items.map((nestedItem, nestedIndex) => {
      const content = renderTimelineItem(turn, nestedItem, nestedIndex, {
        renderComputerUseMcpAsGeneric: true,
        renderBrowserSkillAsGeneric: options?.renderBrowserSkillAsGeneric,
      });
      if (!content) return null;
      return (
        <div key={timelineItemKey(turn.id, nestedIndex, nestedItem)} className="agent-step-item">
          <div className="agent-step-content">{content}</div>
        </div>
      );
    });
  }

  const originalThreadActionLogIndex = useMemo(
    () => buildRunnerOriginalActionLogIndex(turns),
    [turns],
  );

  async function handlePermissionDecision(log: RunnerLog, decision: "allow" | "deny") {
    const requestId = String(log.metadata?.permissionRequestId || "").trim();
    if (!currentThreadId || !requestId || !normalizedBackendUrl || !apiKey.trim()) {
      throw new Error("This permission request is missing the thread or request identity required to submit a decision.");
    }
    const headers = buildRunnerHeaders(requestHeaders, apiKey.trim());
    headers.set("Content-Type", "application/json");
    const response = await fetch(
      `${normalizedBackendUrl}/threads/${encodeURIComponent(currentThreadId)}/permission-requests/${encodeURIComponent(requestId)}/decision`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ decision }),
      }
    );
    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      throw new Error(bodyText || `Failed to ${decision === "allow" ? "approve" : "deny"} permission request (${response.status})`);
    }
    const decisionResult = await response.json().catch(() => null) as {
      active?: boolean;
      canonicalMirrored?: boolean;
      message?: string;
    } | null;
    if (decisionResult?.canonicalMirrored === false) {
      setInlineError("The permission ruling was applied, but the live Thread view could not confirm its durable update. Refresh to reconcile the run state.");
    }
    if (decisionResult?.active === false && decisionResult.message) {
      setInlineError(decisionResult.message);
    }
    const nextTurnStatus: RunnerTurnStatus = decisionResult?.active === false
      ? "cancelled"
      : "running";
    const completedAtMs = decisionResult?.active === false ? Date.now() : undefined;
    setTurns((previousTurns) =>
      previousTurns.map((turn) => ({
        ...turn,
        status: turn.status === "permission_asked" ? nextTurnStatus : turn.status,
        completedAtMs: turn.status === "permission_asked" && completedAtMs ? completedAtMs : turn.completedAtMs,
        logs: turn.logs.map((entry) => {
          if (entry.metadata?.permissionRequestId !== requestId) {
            return entry;
          }
          return {
            ...entry,
            type: decision === "allow" ? "success" : "warning",
            metadata: {
              ...entry.metadata,
              status: decision === "allow" ? "approved" : "denied",
              decision: decision === "allow" ? "approved" : "denied",
            },
          };
        }),
      }))
    );
    try {
      onThreadStatusChange?.(currentThreadId, nextTurnStatus);
    } catch (error) {
      reportRunnerLifecycleCallbackError("onThreadStatusChange", error);
    }
  }

  function renderCanonicalThreadAction(action: RunnerThreadAction) {
    const original = resolveRunnerOriginalActionLog(
      action,
      originalThreadActionLogIndex,
    );
    if (original) {
      const timelineState = getTurnTimelineState(original.turn);
      const originalTimelineItemIndex = timelineState.displayedTimelineItems.findIndex((item) => {
        if (item.kind === "log") return item.log === original.log;
        if (item.kind === "browser_group") return item.logs.includes(original.log);
        if (item.kind === "deep_research_group") return item.runningCommandLog === original.log || item.logs.includes(original.log);
        if (item.kind === "computer_use_group") return item.group.logs.includes(original.log) || item.group.sessionLogs.includes(original.log);
        return item.invocationLog === original.log || item.completionLog === original.log || item.logs.includes(original.log);
      });
      if (originalTimelineItemIndex >= 0) {
        const originalTimelineItem = timelineState.displayedTimelineItems[originalTimelineItemIndex];
        const isGroupedAnchor = originalTimelineItem.kind === "log"
          || (originalTimelineItem.kind === "browser_group" && originalTimelineItem.logs[0] === original.log)
          || (originalTimelineItem.kind === "deep_research_group" && (originalTimelineItem.logs[0] || originalTimelineItem.runningCommandLog) === original.log)
          || (originalTimelineItem.kind === "computer_use_group" && originalTimelineItem.group.startLog === original.log)
          || (originalTimelineItem.kind === "subagent_group" && originalTimelineItem.invocationLog === original.log);
        if (!isGroupedAnchor) return null;
        return renderTimelineItem(original.turn, originalTimelineItem, originalTimelineItemIndex);
      }
    }

    const log = original?.log || adaptRunnerThreadActionToRunnerLog(action);
    const runnerEnvironmentId = scopedActiveThreadEnvironmentId || selectedEnvironment?.id || environmentId || null;
    const runnerHeaders = buildRunnerHeaders(requestHeaders, apiKey.trim());
    return (
      <RunnerWorkLogEntry
        log={log}
        backendUrl={normalizedBackendUrl}
        environmentId={runnerEnvironmentId}
        requestHeaders={runnerHeaders}
        activeTaskPreviewId={activeTaskPreviewId}
        availableAgents={agents}
        availableEnvironments={availableEnvironments}
        availableProjects={availableProjects}
        onPreviewDocument={(attachment) => toggleDocumentAttachmentPreview(attachment)}
        onWorkspacePathClick={(path) => {
          const normalizedPath = String(path || "").trim();
          if (!normalizedPath) return;
          toggleDocumentAttachmentPreview({
            ...buildRunnerPreviewAttachmentFromPath(normalizedPath, {
              backendUrl: normalizedBackendUrl,
              environmentId: runnerEnvironmentId,
              idPrefix: "thread-action-path",
            }),
            workspacePath: normalizedPath,
          });
        }}
        onPermissionDecision={handlePermissionDecision}
        onTaskPreviewClick={onTaskPreviewClick}
        onAgentPreviewClick={(agent) => {
          if (typeof onAgentTurnClick !== "function") return;
          onAgentTurnClick({
            turnId: action.runId,
            agentId: agent.agentId || undefined,
            agentName: agent.agentName || undefined,
          });
        }}
        onEnvironmentPreviewClick={(environment) => {
          const normalizedEnvironmentId = String(environment.environmentId || "").trim();
          if (!normalizedEnvironmentId) return;
          onResourcePreviewClick?.({
            id: normalizedEnvironmentId,
            name: String(environment.environmentName || "Environment").trim() || "Environment",
            resourceType: "environment",
            description: null,
            model: null,
            category: null,
            projectId: null,
            projectName: null,
            isDefault: false,
            status: null,
          });
        }}
        onProjectPreviewClick={(project) => {
          const normalizedProjectId = String(project.projectId || "").trim();
          if (!normalizedProjectId) return;
          onResourcePreviewClick?.({
            id: normalizedProjectId,
            name: String(project.projectName || "Project").trim() || "Project",
            resourceType: "project",
            description: null,
            model: null,
            category: null,
            projectId: normalizedProjectId,
            projectName: String(project.projectName || "").trim() || null,
            isDefault: false,
            status: null,
          });
        }}
        onOpenTaskList={onOpenTaskList}
      />
    );
  }

  function renderTimelineItem(turn: RunnerTurn, item: RunnerTimelineItem, index: number, options?: { renderComputerUseMcpAsGeneric?: boolean; renderBrowserSkillAsGeneric?: boolean }) {
    const runnerEnvironmentId = scopedActiveThreadEnvironmentId || selectedEnvironment?.id || environmentId || null;
    const runnerHeaders = buildRunnerHeaders(requestHeaders, apiKey.trim());

    if (item.kind === "browser_group") {
      const latestLog = item.logs[item.logs.length - 1];
      const browserGroupId = getBrowserTimelineGroupId(item.logs);
      return (
        <BrowserSkillLogBox
          log={latestLog}
          logs={item.logs}
          timeLabel={latestLog ? toDurationLabel(latestLog, turn.startedAtMs) : undefined}
          backendUrl={normalizedBackendUrl}
          environmentId={runnerEnvironmentId}
          requestHeaders={runnerHeaders}
          isDetailOpen={
            selectedComputerUseDetail?.turnId === turn.id &&
            selectedComputerUseDetail?.kind === "browser" &&
            selectedComputerUseDetail?.groupId === browserGroupId
          }
          onOpenDetails={() => openBrowserDetailDrawer(turn.id, browserGroupId)}
        />
      );
    }

    if (item.kind === "computer_use_group") {
      const latestLog = item.group.logs[item.group.logs.length - 1] || item.group.endLog;
      const computerUseEnvironmentName =
        turn.environmentName || scopedActiveThreadEnvironmentName || selectedEnvironment?.name || displayedEnvironmentLabel || "Environment";
      return (
        <BrowserSkillLogBox
          log={latestLog}
          logs={item.group.logs}
          timeLabel={latestLog ? toDurationLabel(latestLog, turn.startedAtMs) : undefined}
          backendUrl={normalizedBackendUrl}
          environmentId={runnerEnvironmentId}
          requestHeaders={runnerHeaders}
          environmentName={computerUseEnvironmentName}
          isDetailOpen={
            selectedComputerUseDetail?.turnId === turn.id &&
            selectedComputerUseDetail?.groupId === item.group.id
          }
          onOpenEnvironmentDesktop={() => {
            void openEnvironmentDesktopWindow(runnerEnvironmentId, computerUseEnvironmentName);
          }}
          onOpenDetails={() => openComputerUseDetailDrawer(turn.id, item.group.id)}
        />
      );
    }

    if (item.kind === "deep_research_group") {
      const firstLog = item.logs[0] || item.runningCommandLog;
      const deepResearchSession = resolveDeepResearchSessionForGroup({
        logs: item.logs,
        runningCommandLog: item.runningCommandLog,
        turn,
        sessions: deepResearchSessions,
      });
      return (
        <DeepResearchLogBox
          log={item.runningCommandLog}
          logs={item.logs}
          runningCommandLog={item.runningCommandLog}
          session={deepResearchSession}
          timeLabel={firstLog ? toDurationLabel(firstLog, turn.startedAtMs) : undefined}
          fallbackTopic={extractDeepResearchTopicFromGroup(item.logs, item.runningCommandLog) || turn.prompt || null}
          isDetailOpen={selectedDeepResearchDetail?.turnId === turn.id}
          onOpenDetails={() => openDeepResearchDetailDrawer(turn.id)}
        />
      );
    }

    if (item.kind === "subagent_group") {
      const presentation = buildSubagentGroupPresentation(turn, item, {
        displayedAgentLabel,
        displayedEnvironmentLabel,
      });

      return (
        <SubagentLogBox
          title={presentation.title}
          prompt={presentation.prompt}
          timeLabel={presentation.timeLabel}
          running={presentation.running}
          summaryMessage={presentation.previewMessage}
          isDetailOpen={
            selectedSubagentDetail?.turnId === turn.id &&
            selectedSubagentDetail?.invocationId === presentation.invocationId
          }
          onOpenDetails={() => openSubagentDetailDrawer(turn.id, presentation.invocationId)}
        />
      );
    }

    if (!shouldDisplayTimelineLog(item.log)) return null;
    return (
      <RunnerWorkLogEntry
        log={item.log}
        timeLabel={toDurationLabel(item.log, turn.startedAtMs)}
        backendUrl={normalizedBackendUrl}
        environmentId={runnerEnvironmentId}
        requestHeaders={runnerHeaders}
        renderComputerUseMcpAsGeneric={options?.renderComputerUseMcpAsGeneric}
        renderBrowserSkillAsGeneric={options?.renderBrowserSkillAsGeneric}
        activeTaskPreviewId={activeTaskPreviewId}
        availableAgents={agents}
        availableEnvironments={availableEnvironments}
        availableProjects={availableProjects}
        onPreviewDocument={(attachment) => toggleDocumentAttachmentPreview(attachment)}
        onTaskPreviewClick={onTaskPreviewClick}
        onOpenTaskList={onOpenTaskList}
        onAgentPreviewClick={(agent) => {
          if (typeof onAgentTurnClick !== "function") return;
          onAgentTurnClick({
            turnId: turn.id,
            agentId: agent.agentId || undefined,
            agentName: agent.agentName || undefined,
          });
        }}
        onEnvironmentPreviewClick={(environment) => {
          const normalizedEnvironmentId = String(environment.environmentId || "").trim();
          if (!normalizedEnvironmentId) return;
          onResourcePreviewClick?.({
            id: normalizedEnvironmentId,
            name: String(environment.environmentName || "Environment").trim() || "Environment",
            resourceType: "environment",
            description: null,
            model: null,
            category: null,
            projectId: null,
            projectName: null,
            isDefault: false,
            status: null,
          });
        }}
        onProjectPreviewClick={(project) => {
          const normalizedProjectId = String(project.projectId || "").trim();
          if (!normalizedProjectId) return;
          onResourcePreviewClick?.({
            id: normalizedProjectId,
            name: String(project.projectName || "Project").trim() || "Project",
            resourceType: "project",
            description: null,
            model: null,
            category: null,
            projectId: normalizedProjectId,
            projectName: String(project.projectName || "").trim() || null,
            isDefault: false,
            status: null,
          });
        }}
        onPermissionDecision={handlePermissionDecision}
        onWorkspacePathClick={(path) => handleSummaryWorkspacePathClick(turn, path, "working_log")}
      />
    );
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
  const renderTurnAgentTrigger = useCallback((turn: RunnerTurn, turnAgentLabel: string, turnAgentPhotoUrl: string) => {
    const content = (
      <>
        {renderTurnAgentAvatar(turnAgentLabel, turnAgentPhotoUrl)}
        <span className="tb-turn-agent-name">{turnAgentLabel}</span>
      </>
    );
    if (typeof onAgentTurnClick !== "function" || !String(turnAgentLabel || "").trim()) {
      return <div className="tb-turn-agent">{content}</div>;
    }
    return (
      <button
        type="button"
        className="tb-turn-agent tb-turn-agent-button"
        onClick={() => handleTurnAgentClick(turn, turnAgentLabel)}
        aria-label={`Open agent details for ${turnAgentLabel}`}
        title={`Open ${turnAgentLabel}`}
      >
        {content}
      </button>
    );
  }, [handleTurnAgentClick, onAgentTurnClick]);
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
  const sourceThreadEnvironmentId = hasCurrentThread
    ? scopedActiveThreadEnvironmentId || selectedEnvironment?.id || environmentId || null
    : null;
  const sourceThreadEnvironmentName = hasCurrentThread
    ? scopedActiveThreadEnvironmentName || selectedEnvironment?.name || null
    : null;
  const selectedForkExistingEnvironment =
    availableEnvironments.find((environment) => environment.id === forkTargetEnvironmentId) ||
    (sourceThreadEnvironmentId && sourceThreadEnvironmentId === forkTargetEnvironmentId
      ? {
          id: sourceThreadEnvironmentId,
          name: sourceThreadEnvironmentName || "Current Environment",
        }
      : null);
  const orderedForkTargetEnvironments = useMemo(
    () => orderOptionsWithPinnedTop(availableEnvironments, forkTargetEnvironmentId || sourceThreadEnvironmentId),
    [availableEnvironments, forkTargetEnvironmentId, sourceThreadEnvironmentId]
  );
  const shouldShowForkExistingEnvironmentCopyOptions =
    forkTarget === "existing_environment" &&
    Boolean(forkTargetEnvironmentId) &&
    Boolean(sourceThreadEnvironmentId) &&
    forkTargetEnvironmentId !== sourceThreadEnvironmentId;
  const githubConnected = githubConfig?.connected ?? false;
  const notionConnected = notionConfig?.connected ?? false;
  const googleDriveConnected = googleDriveConfig?.connected ?? false;
  const oneDriveConnected = oneDriveConfig?.connected ?? false;
  const composerPlanDisplay = getRunnerComposerPlanDisplay(composerPlanTierId);
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
  const selectedComposerOrganizationId = String(composerOrganizationId || "").trim();
  const selectedComposerOrganization = composerOrganizationOptions.find((organization) => organization.id === selectedComposerOrganizationId)
    || composerOrganizationOptions.find((organization) => organization.isDefault)
    || composerOrganizationOptions[0]
    || null;
  const composerOrganizationLabel = selectedComposerOrganization?.name || "Organization";
  const canChangeComposerOrganization =
    composerOrganizationOptions.length > 1 &&
    typeof onComposerOrganizationChange === "function";
  const scheduleEnabled = (scheduleConfig?.enabled ?? false) || scheduledTask !== null;
  const githubContextLabel = githubConfig?.contextLabel || "Branch";
  const defaultGithubBranchFromContext = useMemo(() => {
    const selectedContext = githubContexts.find((context) => context.id === selectedGithubContextId);
    return String(selectedContext?.name || selectedGithubContextId || "").trim();
  }, [githubContexts, selectedGithubContextId]);

  function getGithubSelectedBranchForRepo(repoFullName: string, fallbackRef?: string | null): string {
    const normalizedRepoFullName = String(repoFullName || "").trim();
    if (!normalizedRepoFullName) {
      return String(fallbackRef || defaultGithubBranchFromContext || "main").trim() || "main";
    }
    return String(
      githubSelectedBranchByRepoFullName[normalizedRepoFullName]
      || fallbackRef
      || defaultGithubBranchFromContext
      || "main"
    ).trim() || "main";
  }

  function buildGithubEffectiveRootItem(item: RunnerChatFileNode): RunnerChatFileNode {
    if (!item.repoFullName || item.parentId) {
      return item;
    }
    const selectedBranch = getGithubSelectedBranchForRepo(item.repoFullName, item.ref);
    return {
      ...item,
      id: createGithubBrowserRepoFolderId(item.repoFullName, selectedBranch),
      ref: selectedBranch,
    };
  }
  const workspaceRootLabel = workspaceConfig?.rootLabel || "Workspace";
  const googleDriveRootLabel = googleDriveConfig?.rootLabel || "My Drive";
  const oneDriveRootLabel = oneDriveConfig?.rootLabel || "OneDrive";
  const githubRootLabel = "Repositories";
  const notionRootLabel = "Notion";
  const currentFileBrowserEntry = fileBrowserHistory[fileBrowserHistoryIndex] || { source: fileBrowserSource, folderId: null };
  const currentFileBrowserSource = currentFileBrowserEntry.source;
  const currentFileBrowserFolderId = currentFileBrowserEntry.folderId;
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
        : selectedEnvironment?.name || workspaceRootLabel;
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
  const filteredFileBrowserItems = fileBrowserSearchQuery.trim()
    ? visibleFileBrowserItems.filter((item) => item.name.toLowerCase().includes(fileBrowserSearchQuery.trim().toLowerCase()))
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
  const documentPreviewHeaderActions = previewedDocumentAttachment ? (
    <>
      <span className="tb-document-preview-actions-shell" ref={documentPreviewActionMenuRef}>
        <button
          type="button"
          className="tb-attachment-preview-drawer-action"
          onClick={() => setDocumentPreviewActionMenuOpen((current) => !current)}
          aria-label="File actions"
          aria-expanded={documentPreviewActionMenuOpen}
          title="File actions"
        >
          <LucideEllipsis className="tb-attachment-preview-drawer-action-icon" strokeWidth={1.9} />
        </button>
        {documentPreviewActionMenuOpen ? (
          <PlatformPopupSurface className="tb-document-preview-actions-menu" role="menu">
            {previewedDocumentOpenUrl ? (
              <a
                className="tb-document-preview-actions-menu-item"
                href={previewedDocumentOpenUrl}
                target="_blank"
                rel="noreferrer"
                role="menuitem"
                onClick={() => setDocumentPreviewActionMenuOpen(false)}
              >
                Open in new tab
              </a>
            ) : null}
            <button
              type="button"
              className="tb-document-preview-actions-menu-item"
              role="menuitem"
              onClick={() => copyDocumentPreviewValue(previewedDocumentAttachment.filename)}
            >
              Copy filename
            </button>
            {previewedDocumentWorkspacePath ? (
              <button
                type="button"
                className="tb-document-preview-actions-menu-item"
                role="menuitem"
                onClick={() => copyDocumentPreviewValue(`/workspace/${previewedDocumentWorkspacePath}`)}
              >
                Copy path
              </button>
            ) : null}
          </PlatformPopupSurface>
        ) : null}
      </span>
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
  const contextIndicatorSource = threadContextDetails || threadContext;
  const contextIndicatorMetrics = deriveThreadContextDisplayMetrics(contextIndicatorSource);
  const contextUsageRatio = Math.max(0, Math.min(1, contextIndicatorMetrics.usedRatio));
  const contextIndicatorTitle = buildContextIndicatorTitle(contextIndicatorSource, Boolean(currentThreadId), isThreadContextLoading);
  const contextDetails = threadContextDetails || threadContext;
  const fallbackThreadContextDetails: RunnerChatThreadContextDetails = {
    threadId: currentThreadId || "",
    sessionId: null,
    model: currentThreadId ? "Waiting for context data" : "No active thread",
    maxTokens: 0,
    usedTokens: 0,
    remainingTokens: 0,
    remainingRatio: 0,
    source: "empty",
    exact: false,
    categories: EMPTY_THREAD_CONTEXT_CATEGORIES,
  };
  const displayContextDetails = contextDetails || fallbackThreadContextDetails;
  const displayContextMetrics = deriveThreadContextDisplayMetrics(displayContextDetails);
  const contextCategoryOrder: RunnerChatThreadContextCategoryKey[] = ["system_prompt", "skills", "messages", "autocompact_buffer", "free_space", "other"];
  const contextCategories = threadContextDetails?.categories || EMPTY_THREAD_CONTEXT_CATEGORIES;
  const orderedContextCategories = [...contextCategories].sort(
    (left, right) => contextCategoryOrder.indexOf(left.key) - contextCategoryOrder.indexOf(right.key)
  );
  const visibleContextCategories = orderedContextCategories.filter((category) => category.tokens > 0 || category.key === "free_space");
  const hasDisplayContextUsage = Boolean(contextDetails) && displayContextDetails.maxTokens > 0;
  const nativeContextUsedPercent = Math.round((displayContextMetrics.usedTokens / Math.max(displayContextDetails.maxTokens, 1)) * 100);
  const hasReceivedFirstAssistantAnswer =
    Boolean(threadContextDetails?.sessionId || threadContext?.sessionId) ||
    turns.some((turn) => turn.logs.some((log) => log.eventType === "agent_message" || log.eventType === "llm_response"));
  const hasBackendThreadContextActionAvailability =
    threadContextAvailableActions.compact || threadContextAvailableActions.clear || threadContextAvailableActions.fork;
  const canStageThreadContextManagementActions =
    hasReceivedFirstAssistantAnswer || hasBackendThreadContextActionAvailability;
  const canUseBtwThreadContextAction = Boolean(currentThreadId) && currentThreadHasMessages;
  const effectiveThreadContextAvailableActions: RunnerChatThreadContextAvailableActions = {
    compact: canStageThreadContextManagementActions,
    clear: canStageThreadContextManagementActions,
    btw: canUseBtwThreadContextAction,
    fork: canStageThreadContextManagementActions,
  };
  const agentPopupEmptyLabel =
    agentPopupMode === "teams"
      ? "No teams available."
      : agentPopupMode === "humans"
        ? "No humans available."
        : "No agents available.";
  const workspacePopupEmptyLabel =
    workspaceSelectorMode === "projects"
      ? "No projects available."
      : "No computers available.";
	  const speechToTextTitle = !hasApiKey
	    ? "Enter an API key to enable speech-to-text"
	    : supportsSpeechToText
	      ? isListening
	        ? "Stop speech to text"
	        : "Start speech to text"
	      : "Speech-to-text is not supported in this browser";
  const selectedAgentVoiceMode = normalizeRunnerChatVoiceMode(selectedAgent?.voiceMode);
  const selectedAgentWebVoiceEnabled = useComputerAgentsMode && isRunnerChatWebVoiceMode(selectedAgentVoiceMode);
  const isVoiceModeActive = voiceModeState.status === "connected";
  const isVoiceModeBusy = voiceModeState.status === "starting" || voiceModeState.status === "closing";
  const shouldShowVoiceModeButton = useComputerAgentsMode && (selectedAgentWebVoiceEnabled || isVoiceModeActive || isVoiceModeBusy || voiceModeState.status === "error");
  const voiceModeButtonTitle = isVoiceModeActive
    ? "End voice mode"
    : selectedAgentWebVoiceEnabled
      ? "Start voice mode"
      : "Enable Web voice mode on this agent first";

  function renderVoiceModeControl(isFull = false) {
    if (!shouldShowVoiceModeButton) {
      return null;
    }
    const isDisabled = Boolean(disabled || (isVoiceModeBusy && !isVoiceModeActive) || (!isVoiceModeActive && !selectedAgentWebVoiceEnabled));
    return (
      <button
        type="button"
        className={`task-voice-button ${isFull ? "task-voice-button-full" : ""} ${isVoiceModeActive ? "active" : ""}`.trim()}
        onClick={() => {
          if (isVoiceModeActive) {
            void stopVoiceModeSession();
          } else {
            void startVoiceModeSession();
          }
        }}
        disabled={isDisabled}
        aria-label={isVoiceModeActive ? "End voice mode" : "Start voice mode"}
        title={voiceModeButtonTitle}
      >
        {isVoiceModeBusy ? (
          <LucideLoaderCircle className="task-voice-icon task-voice-icon-spinner" strokeWidth={1.9} />
        ) : (
          <LucideAudioLines className="task-voice-icon" strokeWidth={1.9} />
        )}
      </button>
    );
  }

  function renderVoiceModeStatusBar() {
    if (!useComputerAgentsMode || voiceModeState.status === "idle") {
      return null;
    }
    const voiceModeLabel =
      voiceModeState.status === "starting"
        ? "Starting voice mode"
        : voiceModeState.status === "closing"
          ? "Ending voice mode"
          : voiceModeState.status === "error"
            ? "Voice mode error"
            : "Voice mode active";
    const transcript = voiceModeState.lastAssistantTranscript || voiceModeState.lastUserTranscript || "";
    return (
      <div className={`tb-voice-session-strip ${voiceModeState.status === "error" ? "is-error" : ""}`.trim()}>
        <LucideAudioLines className="tb-voice-session-strip-icon" strokeWidth={1.8} />
        <div className="tb-voice-session-strip-copy">
          <span className="tb-voice-session-strip-title">{voiceModeLabel}</span>
          <span className="tb-voice-session-strip-meta">
            {voiceModeState.error || transcript || voiceModeState.agentName || "Live voice session"}
          </span>
        </div>
        {isVoiceModeActive || voiceModeState.status === "error" ? (
          <button
            type="button"
            className="tb-voice-session-strip-action"
            onClick={() => void stopVoiceModeSession()}
          >
            End
          </button>
        ) : null}
      </div>
    );
  }

	  function renderComposerOrganizationSelector() {
    return (
      <div className="tb-composer-organization-anchor">
        <button
          ref={organizationSelectorButtonRef}
          type="button"
          className={`tb-composer-organization-selector ${showOrganizationPopup ? "active" : ""}`.trim()}
          onClick={() => {
            if (canChangeComposerOrganization) {
              togglePopup("organization");
            }
          }}
          disabled={!canChangeComposerOrganization}
          aria-label={`Organization: ${composerOrganizationLabel}`}
          aria-expanded={showOrganizationPopup}
        >
          <LucideBuilding2 className="tb-composer-organization-icon" strokeWidth={1.45} />
          <span className="tb-composer-organization-label">{composerOrganizationLabel}</span>
          {canChangeComposerOrganization ? <IconChevronDown className="tb-composer-organization-chevron" /> : null}
        </button>

        {renderComposerPopupPortal(
          showOrganizationPopup ? (
            <PlatformPopupSurface ref={organizationPopupRef} className="tb-popup-menu-inline tb-popup-menu-inline-agent tb-popup-menu-inline-organization" animation={mainPopupAnimation}>
              <div className="tb-popup-menu-inline-body tb-popup-menu-inline-body-organization">
                {composerOrganizationOptions.map((organization) => {
                  const isSelected = selectedComposerOrganization?.id === organization.id;
                  return (
                    <button
                      key={organization.id}
                      type="button"
                      className={`tb-popup-row tb-popup-row-select tb-popup-row-agent tb-popup-row-organization ${isSelected ? "selected" : ""}`.trim()}
                      onClick={() => selectComposerOrganization(organization.id)}
                    >
                      <LucideBuilding2 className="tb-popup-icon" strokeWidth={1.6} />
                      <span className="tb-popup-label">{organization.name}</span>
                      <span className="tb-popup-check-slot">
                        {isSelected ? <IconCheck className="tb-popup-check" /> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </PlatformPopupSurface>
          ) : null,
          organizationPopupStyle
        )}
      </div>
    );
  }

  function renderAgentSelectorControl() {
    if (hideAgentSelector || agents.length === 0) {
      return null;
    }

    return (
      <div className="tb-selector-anchor">
        <button
          ref={agentSelectorButtonRef}
          type="button"
          className={`tb-inline-selector tb-inline-selector-agent ${showAgentPopup ? "active" : ""}`.trim()}
          onClick={() => togglePopup("agent")}
        >
          <span>{displayedAgentLabel}</span>
          <span className="tb-composer-agent-button-effort">{selectedReasoningEffortOption.label}</span>
          <IconChevronDown className="tb-inline-selector-chevron" />
        </button>

        {renderComposerPopupPortal(
          showAgentPopup ? (
          <PlatformPopupSurface ref={agentPopupRef} className="tb-popup-menu-inline tb-popup-menu-inline-agent" animation={mainPopupAnimation} animateHeight>
            {!hasApiKey ? (
              <div className="tb-popup-note">
                <div className="tb-popup-note-title">API key required</div>
                <div className="tb-popup-note-body">Enter an API key in the playground sidebar to select an agent.</div>
              </div>
            ) : (
              <>
                <div className="tb-popup-panel-section tb-popup-panel-section-attach-header">
                  <PlatformSwitch
                    className="tb-popup-selector-switch"
                    ariaLabel="Agent type"
                    value={agentPopupMode}
                    options={availableAgentPopupModes.map((mode) => ({
                      value: mode,
                      label: mode === "teams" ? "Squads" : mode === "humans" ? "Humans" : "Agents",
                    }))}
                    onValueChange={(nextMode) => setAgentPopupMode(nextMode as RunnerAgentSelectorMode)}
                  />
                </div>
                <div className="tb-popup-menu-inline-body tb-popup-menu-inline-body-agent">
                  {filteredOrderedAgents.length > 0 ? (
                    filteredOrderedAgents.map((agent) => {
                      const isTeamAgent = getRunnerAgentSelectorMode(agent) === "teams";
                      return (
                        <button
                          key={agent.id}
                          type="button"
                          className={`tb-popup-row tb-popup-row-select tb-popup-row-agent ${selectedAgentId === agent.id ? "selected" : ""}`}
                          onClick={() => selectAgent(agent.id)}
                        >
                          {isTeamAgent ? <IconLayers className="tb-popup-icon" /> : renderRunnerAgentOptionIcon(agent)}
                          <span className="tb-popup-label">{agent.name}</span>
                          <span className="tb-popup-check-slot">
                            {selectedAgentId === agent.id ? <IconCheck className="tb-popup-check" /> : null}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="tb-popup-menu-inline-empty">
                      <div className="tb-popup-empty-state">{agentPopupEmptyLabel}</div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className={`tb-popup-row tb-popup-row-core-action tb-agent-reasoning-effort-entry ${showAgentReasoningPopup ? "selected" : ""}`.trim()}
                  onClick={() => setActiveInputPopup("agent-reasoning")}
                >
                  <LucideBrain className="tb-popup-icon" strokeWidth={1.75} />
                  <span className="tb-popup-label">Reasoning effort</span>
                  <span className="tb-popup-value">{selectedReasoningEffortOption.label}</span>
                  <IconChevronRight className="tb-popup-chevron" />
                </button>
              </>
            )}
          </PlatformPopupSurface>
          ) : null,
          agentPopupStyle
        )}

        {renderComposerPopupPortal(
          showAgentReasoningPopup ? (
          <PlatformPopupSurface ref={agentReasoningPopupRef} className="tb-popup-menu-side tb-popup-menu-agent-reasoning" animation={sidePopupAnimation}>
            <div className="tb-popup-attach-topbar">
              <button type="button" className="tb-popup-attach-topbar-button tb-popup-attach-topbar-button-close" onClick={closeAgentReasoningPopup} aria-label="Close reasoning effort popup">
                <LucideX className="tb-popup-attach-topbar-icon" strokeWidth={1.75} />
              </button>
              <div className="tb-popup-attach-topbar-title">Reasoning effort</div>
              <button type="button" className="tb-popup-attach-topbar-button tb-popup-attach-topbar-button-confirm" onClick={() => closeAllInputPopups()} aria-label="Done">
                <LucideCheck className="tb-popup-attach-topbar-icon" strokeWidth={2} />
              </button>
            </div>
            <div className="tb-agent-reasoning-effort-panel tb-agent-reasoning-effort-panel-side" onClick={(event) => event.stopPropagation()}>
              <PlatformSwitch
                className="tb-agent-reasoning-effort-tabs"
                ariaLabel="Reasoning effort"
                value={selectedReasoningEffortOption.id}
                options={RUNNER_REASONING_EFFORT_OPTIONS.map((option) => ({
                  value: option.id,
                  label: option.label,
                  title: option.description,
                }))}
                onValueChange={(nextEffort) => selectReasoningEffort(nextEffort as RunnerReasoningEffortId)}
              />
            </div>
          </PlatformPopupSurface>
          ) : null,
          agentReasoningPopupStyle
        )}
      </div>
    );
  }

  function renderEnvironmentSelectorControl() {
    if (hideEnvironmentSelector) {
      return null;
    }

    return (
      <div className="tb-selector-anchor">
        <button
          ref={environmentSelectorButtonRef}
          type="button"
          className={`tb-inline-selector ${showEnvironmentPopup ? "active" : ""}`.trim()}
          onClick={() => togglePopup("environment")}
        >
          <span>{displayedWorkspaceLabel}</span>
          <IconChevronDown className="tb-inline-selector-chevron" />
        </button>

        {renderComposerPopupPortal(
          showEnvironmentPopup ? (
          <PlatformPopupSurface ref={environmentPopupRef} className="tb-popup-menu-inline tb-popup-menu-inline-right tb-popup-menu-inline-workspace" animation={mainPopupAnimation}>
            {!hasApiKey ? (
              <div className="tb-popup-note">
                <div className="tb-popup-note-title">API key required</div>
                <div className="tb-popup-note-body">Enter an API key in the playground sidebar to select a workspace.</div>
              </div>
            ) : (
              <>
                <div className="tb-popup-panel-section tb-popup-panel-section-attach-header">
                  <PlatformSwitch
                    className="tb-popup-selector-switch"
                    ariaLabel="Workspace type"
                    value={workspaceSelectorMode}
                    options={[
                      { value: "computers", label: "Computers" },
                      { value: "projects", label: "Projects" },
                    ]}
                    onValueChange={(nextMode) => {
                      if (nextMode === "computers" || nextMode === "projects") {
                        setWorkspaceSelectorMode(nextMode);
                      }
                    }}
                  />
                </div>
                <div className="tb-popup-menu-inline-body tb-popup-menu-inline-body-agent tb-popup-menu-inline-body-workspace">
                  {workspaceSelectorMode === "projects" ? (
                    orderedProjects.length > 0 ? (
                      orderedProjects.map((project) => {
                        const projectEnvironmentId = getRunnerProjectEnvironmentId(project);
                        const isSelectedProject =
                          effectiveWorkspaceSelectorMode === "projects" && selectedProjectId === project.id;
                        return (
                          <button
                            key={project.id}
                            type="button"
                            className={`tb-popup-row tb-popup-row-select tb-popup-row-agent tb-popup-row-workspace ${isSelectedProject ? "selected" : ""}`}
                            onClick={() => selectProject(project.id)}
                            disabled={!projectEnvironmentId}
                            title={!projectEnvironmentId ? "This project has no linked computer." : project.name}
                          >
                            <LucideRocket className="tb-popup-icon" strokeWidth={1.75} />
                            <span className="tb-popup-label">{project.name}</span>
                            <span className="tb-popup-check-slot">
                              {isSelectedProject ? <IconCheck className="tb-popup-check" /> : null}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="tb-popup-menu-inline-empty">
                        <div className="tb-popup-empty-state">{workspacePopupEmptyLabel}</div>
                      </div>
                    )
                  ) : orderedEnvironments.length > 0 ? (
                    orderedEnvironments.map((environment) => {
                      const isSelectedEnvironment =
                        effectiveWorkspaceSelectorMode === "computers" && selectedEnvironmentId === environment.id;
                      return (
                        <button
                          key={environment.id}
                          type="button"
                          className={`tb-popup-row tb-popup-row-select tb-popup-row-agent tb-popup-row-workspace ${isSelectedEnvironment ? "selected" : ""}`}
                          onClick={() => selectEnvironment(environment.id)}
                        >
                          <LucideMonitor className="tb-popup-icon" strokeWidth={1.75} />
                          <span className="tb-popup-label">{environment.name}</span>
                          <span className="tb-popup-check-slot">
                            {isSelectedEnvironment ? <IconCheck className="tb-popup-check" /> : null}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="tb-popup-menu-inline-empty">
                      <div className="tb-popup-empty-state">{workspacePopupEmptyLabel}</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </PlatformPopupSurface>
          ) : null,
          environmentPopupStyle
        )}
      </div>
    );
  }

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
    onDocumentPreviewOpenChange?.(Boolean(previewedDocumentAttachment));
  }, [onDocumentPreviewOpenChange, previewedDocumentAttachment]);

  useEffect(() => {
    return () => {
      onDocumentPreviewOpenChange?.(false);
    };
  }, [onDocumentPreviewOpenChange]);

  useEffect(() => {
    onDeepResearchDetailOpenChange?.(Boolean(effectiveSelectedDeepResearchDetailPresentation));
  }, [effectiveSelectedDeepResearchDetailPresentation, onDeepResearchDetailOpenChange]);

  useEffect(() => {
    return () => {
      onDeepResearchDetailOpenChange?.(false);
    };
  }, [onDeepResearchDetailOpenChange]);


  function renderThreadContextPopup() {
    if (!hasApiKey) {
      return (
        <PlatformPopupSurface className="tb-popup-menu-context" animation={mainPopupAnimation}>
          <div className="tb-popup-menu-title tb-popup-menu-title-context">Thread Context</div>
          <div className="tb-popup-note">
            <div className="tb-popup-note-title">API key required</div>
            <div className="tb-popup-note-body">Enter an API key in the playground sidebar to inspect and manage thread context.</div>
          </div>
        </PlatformPopupSurface>
      );
    }

    return (
      <PlatformPopupSurface className="tb-popup-menu-context" animation={mainPopupAnimation}>
        <div className="tb-popup-menu-title tb-popup-menu-title-context">
          <span>Thread Context</span>
          {hasDisplayContextUsage ? (
            <span className="tb-context-panel-tokens">
              {formatCompactTokenCount(displayContextMetrics.usedTokens)}/{formatCompactTokenCount(displayContextDetails.maxTokens)} tokens ({nativeContextUsedPercent}%)
            </span>
          ) : null}
        </div>
        {isThreadContextDetailsLoading ? (
          <div className="tb-popup-loading-row">
            <span className="tb-popup-loading-spinner" />
            <span className="tb-popup-loading-label">Loading native thread context…</span>
          </div>
        ) : threadContextDetailsError ? (
          <div className="tb-popup-note">
            <div className="tb-popup-note-title">Context unavailable</div>
            <div className="tb-popup-note-body">{threadContextDetailsError}</div>
            <PlatformSecondaryButton size="large" type="button" className="tb-popup-action tb-popup-action-secondary tb-context-panel-retry" onClick={() => void refreshThreadContextDetails()}>
              Retry
            </PlatformSecondaryButton>
          </div>
        ) : (
          <div className="tb-context-panel">
            <div className="tb-context-panel-bar" aria-hidden="true">
              {visibleContextCategories
                .filter((category) => getContextCategoryDisplayTokens(category, displayContextMetrics) > 0)
                .map((category) => (
                  <span
                    key={category.key}
                    className={`tb-context-panel-bar-segment tb-context-panel-bar-segment-${category.kind === "buffer" ? "used" : category.kind}`}
                    style={
                      {
                        "--tb-context-segment-size": String(
                          displayContextDetails.maxTokens > 0
                            ? getContextCategoryDisplayTokens(category, displayContextMetrics) / displayContextDetails.maxTokens
                            : 0
                        ),
                        "--tb-context-segment-color": threadContextCategoryColor(category),
                      } as CSSProperties
                    }
                  />
                ))}
            </div>

            <div className="tb-context-panel-list">
              {visibleContextCategories.map((category) => (
                <div key={category.key} className="tb-context-panel-row">
                  <span className="tb-context-panel-row-main">
                    <span className="tb-context-panel-row-swatch" style={{ background: threadContextCategoryColor(category) }} />
                  <span className="tb-context-panel-row-label">{category.label}</span>
                </span>
                <span className="tb-context-panel-row-value">
                  {!hasDisplayContextUsage && category.key === "free_space"
                    ? "100%"
                    : `${formatCompactTokenCount(getContextCategoryDisplayTokens(category, displayContextMetrics))} tokens`}
                </span>
              </div>
            ))}
            </div>

            <div className="tb-context-panel-actions">
              <button
                type="button"
                className="tb-context-panel-action"
                disabled={!effectiveThreadContextAvailableActions.compact || threadContextActionLoading !== null}
                onClick={() => void handleContextPopupActionClick("compact")}
              >
                <span className="tb-context-panel-action-single">
                  <LucideMinimize2 className="tb-context-panel-action-icon" strokeWidth={1.75} />
                  <span>/compact</span>
                </span>
              </button>

              <button
                type="button"
                className="tb-context-panel-action"
                disabled={!effectiveThreadContextAvailableActions.clear || threadContextActionLoading !== null}
                onClick={() => void handleContextPopupActionClick("clear")}
              >
                <span className="tb-context-panel-action-single">
                  <LucideEraser className="tb-context-panel-action-icon" strokeWidth={1.75} />
                  <span>/clear</span>
                </span>
              </button>

              <button
                type="button"
                className="tb-context-panel-action"
                disabled={!effectiveThreadContextAvailableActions.btw || threadContextActionLoading !== null}
                onClick={() => void handleContextPopupActionClick("btw")}
              >
                <span className="tb-context-panel-action-single">
                  <LucideMessageCircle className="tb-context-panel-action-icon" strokeWidth={1.75} />
                  <span>/btw</span>
                </span>
              </button>

              <button
                type="button"
                className="tb-context-panel-action"
                disabled={!effectiveThreadContextAvailableActions.fork || threadContextActionLoading !== null}
                onClick={() => void handleContextPopupActionClick("fork")}
              >
                <span className="tb-context-panel-action-single">
                  <LucideGitBranch className="tb-context-panel-action-icon" strokeWidth={1.75} />
                  <span>/fork</span>
                </span>
              </button>
            </div>
          </div>
        )}
      </PlatformPopupSurface>
    );
  }

  function renderContextIndicatorControl() {
    return (
      <div className="tb-selector-anchor tb-context-indicator-anchor">
        <button
          ref={contextIndicatorButtonRef}
          type="button"
          className={`tb-context-indicator-button ${showContextPopup ? "active" : ""} ${isThreadContextLoading ? "loading" : ""}`.trim()}
          onClick={handleContextIndicatorClick}
          aria-label="Conversation context remaining"
          title={contextIndicatorTitle}
        >
          <span className="tb-context-indicator-ring" style={{ "--tb-context-progress": String(contextUsageRatio) } as CSSProperties} />
        </button>

        {renderComposerPopupPortal(
          showContextPopup ? (
            <div ref={contextPopupRef} className="tb-composer-popup-measure">
              {renderThreadContextPopup()}
            </div>
          ) : null,
          contextPopupStyle
        )}
      </div>
    );
  }

  function renderFileBrowserItem(item: RunnerChatFileNode, depth = 0) {
    const isGithubRepoRootRow =
      currentFileBrowserSource === "github"
      && item.isFolder
      && depth === 0
      && !item.parentId
      && Boolean(item.repoFullName);
    const effectiveItem = isGithubRepoRootRow ? buildGithubEffectiveRootItem(item) : item;
    const effectiveItemId = effectiveItem.id;
    const isSelected = selectedFileBrowserIds.includes(effectiveItemId);
    const isPreviewActive = previewFileBrowserItem?.id === effectiveItemId;
    const isExpanded = expandedFileBrowserFolderIds.includes(effectiveItemId);
    const isFolderLoading =
      currentFileBrowserSource === "workspace"
        ? loadingWorkspaceFolderIds.includes(effectiveItemId)
        : currentFileBrowserSource === "google-drive"
          ? loadingGoogleDriveFolderIds.includes(effectiveItemId)
          : currentFileBrowserSource === "one-drive"
            ? loadingOneDriveFolderIds.includes(effectiveItemId)
            : currentFileBrowserSource === "github"
              ? loadingGithubFolderIds.includes(effectiveItemId)
              : false;
    const workspaceFolderError =
      currentFileBrowserSource === "workspace"
        ? workspaceFolderErrorsById[effectiveItemId] || ""
        : "";
    const nestedItems = fileBrowserSearchQuery.trim() ? [] : fileItemsForParent(fileBrowserItems, effectiveItemId);
    const showGithubFolderCheckbox = currentFileBrowserSource === "github" && item.isFolder;
    const githubRepoFullName = String(effectiveItem.repoFullName || "").trim();
    const githubBranchOptions = githubRepoFullName
      ? githubBranchesByRepoFullName[githubRepoFullName] || []
      : [];
    const githubSelectedBranch = githubRepoFullName
      ? getGithubSelectedBranchForRepo(githubRepoFullName, effectiveItem.ref)
      : "";
    const isGithubBranchLoading = githubRepoFullName
      ? githubBranchLoadingRepoFullNames.includes(githubRepoFullName)
      : false;
    const githubBranchSelectOptions =
      githubSelectedBranch && !githubBranchOptions.some((option) => option.id === githubSelectedBranch || option.name === githubSelectedBranch)
        ? [{ id: githubSelectedBranch, name: githubSelectedBranch }, ...githubBranchOptions]
        : githubBranchOptions;

    return (
      <div key={effectiveItemId}>
        <div
          className={`tb-file-browser-item ${isPreviewActive ? "preview" : ""} ${isSelected ? "selected" : ""}`}
          onClick={() => handleFileBrowserItemClick(effectiveItem)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleFileBrowserItemClick(effectiveItem);
            }
          }}
          role="button"
          tabIndex={0}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
        >
          {item.isFolder ? (
            <button type="button" className="tb-file-browser-item-leading" onClick={(event) => toggleFileBrowserFolderExpansion(effectiveItemId, event)}>
              {isFolderLoading ? <IconLoader2 className="tb-file-browser-folder-chevron tb-file-browser-folder-chevron-spin" /> : isExpanded ? <IconChevronDown className="tb-file-browser-folder-chevron" /> : <IconChevronRight className="tb-file-browser-folder-chevron" />}
            </button>
          ) : (
            <div
              className={`tb-file-browser-check ${isSelected ? "selected" : ""}`}
              onClick={(event) => {
                event.stopPropagation();
                handleFileBrowserItemClick(effectiveItem);
              }}
            >
              {isSelected ? <IconCheck className="tb-file-browser-check-icon" /> : null}
            </div>
          )}
          {showGithubFolderCheckbox ? (
            <div
              className={`tb-file-browser-check ${isSelected ? "selected" : ""}`}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedGithubFileIds((current) => toggleFileSelection(current, effectiveItemId));
              }}
            >
              {isSelected ? <IconCheck className="tb-file-browser-check-icon" /> : null}
            </div>
          ) : null}
          {renderBrowserFileIcon(effectiveItem, "tb-file-browser-item-icon")}
          <span className="tb-file-browser-item-name">{effectiveItem.name}</span>
          {isGithubRepoRootRow ? (
            <div className="tb-file-browser-item-branch-slot">
              <select
                className="tb-file-browser-item-branch-select"
                value={githubSelectedBranch}
                disabled={isGithubBranchLoading}
                onFocus={() => {
                  void ensureGithubBranchesLoaded(githubRepoFullName, effectiveItem.ref);
                }}
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onChange={(event) => {
                  event.stopPropagation();
                  handleGithubRepoBranchChange(effectiveItem, event.target.value);
                }}
              >
                {githubBranchSelectOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <span className="tb-file-browser-item-meta">{formatBrowserFileDate(effectiveItem.modifiedTime)}</span>
              <span className="tb-file-browser-item-size">{effectiveItem.isFolder ? "" : formatBrowserFileSize(effectiveItem.size)}</span>
            </>
          )}
        </div>

        {item.isFolder && isExpanded ? (
          <div className="tb-file-browser-item-children">
            {nestedItems.length > 0 ? nestedItems.map((nestedItem) => renderFileBrowserItem(nestedItem, depth + 1)) : null}
            {workspaceFolderError && nestedItems.length === 0 ? (
              <div className="tb-file-browser-empty">{workspaceFolderError}</div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  useEffect(() => {
    return () => {
      if (fileBrowserPreviewObjectUrlRef.current) {
        URL.revokeObjectURL(fileBrowserPreviewObjectUrlRef.current);
        fileBrowserPreviewObjectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!showFileBrowserModal || currentFileBrowserSource !== "workspace") {
      return;
    }

    if (!hasApiKey) {
      setRemoteWorkspaceItems([]);
      setLoadedWorkspaceFolderIds([]);
      setLoadingWorkspaceFolderIds([]);
      setWorkspaceFolderErrorsById({});
      setWorkspaceBrowserError(null);
      setIsWorkspaceBrowserLoading(false);
      return;
    }

    if (!activeWorkspaceEnvironmentId) {
      setRemoteWorkspaceItems([]);
      setLoadedWorkspaceFolderIds([]);
      setLoadingWorkspaceFolderIds([]);
      setWorkspaceFolderErrorsById({});
      setWorkspaceBrowserError("Select an environment to browse workspace files.");
      setIsWorkspaceBrowserLoading(false);
      return;
    }

    const folderId = currentFileBrowserFolderId || "root";
    if (loadedWorkspaceFolderIds.includes(folderId) || loadingWorkspaceFolderIds.includes(folderId)) {
      return;
    }

    void loadWorkspaceFolder(folderId);
  }, [
    apiKey,
    currentFileBrowserFolderId,
    currentFileBrowserSource,
    hasApiKey,
    loadedWorkspaceFolderIds,
    loadingWorkspaceFolderIds,
    normalizedBackendUrl,
    activeWorkspaceEnvironmentId,
    showFileBrowserModal,
  ]);

  useEffect(() => {
    if (!showFileBrowserModal || currentFileBrowserSource !== "google-drive" || !googleDriveConnected || !googleDriveConfig?.fetchItems) {
      return;
    }

    const folderId = currentFileBrowserFolderId || "root";
    if (loadedGoogleDriveFolderIds.includes(folderId) || loadingGoogleDriveFolderIds.includes(folderId)) {
      return;
    }

    void loadGoogleDriveFolder(folderId);
  }, [
    currentFileBrowserFolderId,
    currentFileBrowserSource,
    googleDriveConfig,
    googleDriveConnected,
    loadedGoogleDriveFolderIds,
    loadingGoogleDriveFolderIds,
    showFileBrowserModal,
  ]);

  useEffect(() => {
    if (!showFileBrowserModal || currentFileBrowserSource !== "one-drive" || !oneDriveConnected || !oneDriveConfig?.fetchItems) {
      return;
    }

    const folderId = currentFileBrowserFolderId || "root";
    if (loadedOneDriveFolderIds.includes(folderId) || loadingOneDriveFolderIds.includes(folderId)) {
      return;
    }

    void loadOneDriveFolder(folderId);
  }, [
    currentFileBrowserFolderId,
    currentFileBrowserSource,
    loadedOneDriveFolderIds,
    loadingOneDriveFolderIds,
    oneDriveConfig,
    oneDriveConnected,
    showFileBrowserModal,
  ]);

  useEffect(() => {
    if (!showFileBrowserModal || currentFileBrowserSource !== "github" || !githubConnected || !githubConfig?.fetchItems) {
      return;
    }

    const folderId = currentFileBrowserFolderId || "root";
    if (loadedGithubFolderIds.includes(folderId) || loadingGithubFolderIds.includes(folderId)) {
      return;
    }

    void loadGithubFolder(folderId);
  }, [
    currentFileBrowserFolderId,
    currentFileBrowserSource,
    githubConfig,
    githubConnected,
    loadedGithubFolderIds,
    loadingGithubFolderIds,
    showFileBrowserModal,
  ]);

  useEffect(() => {
    if (!showFileBrowserModal || currentFileBrowserSource !== "notion" || !notionConnected || !notionConfig?.fetchDatabases || notionDatabasesLoaded) {
      return;
    }

    let cancelled = false;
    setIsNotionBrowserLoading(true);
    setNotionBrowserError(null);

    void notionConfig.fetchDatabases()
      .then((databases) => {
        if (cancelled) return;
        setRemoteNotionDatabases(databases || []);
        setNotionDatabasesLoaded(true);
        setNotionBrowserError(null);
      })
      .catch((error) => {
        if (cancelled) return;
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        setRemoteNotionDatabases([]);
        setNotionDatabasesLoaded(false);
        setNotionBrowserError(normalizedError.message || "Failed to load Notion databases.");
      })
      .finally(() => {
        if (!cancelled) {
          setIsNotionBrowserLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    currentFileBrowserSource,
    notionConfig?.fetchDatabases,
    notionConnected,
    notionDatabasesLoaded,
    showFileBrowserModal,
  ]);

  useEffect(() => {
    if (fileBrowserPreviewObjectUrlRef.current) {
      URL.revokeObjectURL(fileBrowserPreviewObjectUrlRef.current);
      fileBrowserPreviewObjectUrlRef.current = null;
    }

    if (!previewFileBrowserItem || previewFileBrowserItem.isFolder || !isBrowserFilePreviewable(previewFileBrowserItem)) {
      setFileBrowserPreviewContent(null);
      setFileBrowserPreviewKind(null);
      setIsFileBrowserPreviewLoading(false);
      return;
    }

    const fileType = getBrowserFileType(previewFileBrowserItem.mimeType, previewFileBrowserItem.name);

    const connectorFetchFileContent =
      currentFileBrowserSource === "google-drive"
        ? googleDriveConfig?.fetchFileContent
        : currentFileBrowserSource === "one-drive"
          ? oneDriveConfig?.fetchFileContent
          : currentFileBrowserSource === "github"
            ? githubConfig?.fetchFileContent
            : undefined;

    if (currentFileBrowserSource !== "workspace" && currentFileBrowserSource !== "notion" && connectorFetchFileContent) {

      let cancelled = false;
      setIsFileBrowserPreviewLoading(true);
      setFileBrowserPreviewContent(null);
      setFileBrowserPreviewKind(null);

      void connectorFetchFileContent(previewFileBrowserItem)
        .then((payload) => {
          if (cancelled) return;
          if (!payload?.content) {
            if ((fileType === "image" || fileType === "video") && previewFileBrowserItem.previewUrl) {
              setFileBrowserPreviewKind(fileType);
              setFileBrowserPreviewContent(previewFileBrowserItem.previewUrl);
            } else {
              setFileBrowserPreviewContent(null);
              setFileBrowserPreviewKind(null);
            }
            return;
          }

          if (fileType === "image") {
            const mimeType = payload.mimeType || previewFileBrowserItem.mimeType || "image/png";
            setFileBrowserPreviewKind("image");
            setFileBrowserPreviewContent(`data:${mimeType};base64,${normalizeBase64Content(payload.content)}`);
            return;
          }

          if (fileType === "video" && payload.encoding === "base64") {
            const mimeType = payload.mimeType || previewFileBrowserItem.mimeType || "video/mp4";
            setFileBrowserPreviewKind("video");
            setFileBrowserPreviewContent(`data:${mimeType};base64,${normalizeBase64Content(payload.content)}`);
            return;
          }

          if (payload.encoding === "base64") {
            const decoded = decodeBase64TextContent(payload.content);
            setFileBrowserPreviewKind("text");
            setFileBrowserPreviewContent(decoded.slice(0, 5000));
            return;
          }

          setFileBrowserPreviewKind("text");
          setFileBrowserPreviewContent(payload.content.slice(0, 5000));
        })
        .catch(() => {
          if (cancelled) return;
          if ((fileType === "image" || fileType === "video") && previewFileBrowserItem.previewUrl) {
            setFileBrowserPreviewKind(fileType);
            setFileBrowserPreviewContent(previewFileBrowserItem.previewUrl);
          } else {
            setFileBrowserPreviewContent(null);
            setFileBrowserPreviewKind(null);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsFileBrowserPreviewLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }

    if (currentFileBrowserSource !== "workspace") {
      if ((fileType === "image" || fileType === "video") && previewFileBrowserItem.previewUrl) {
        setFileBrowserPreviewKind(fileType);
        setFileBrowserPreviewContent(previewFileBrowserItem.previewUrl);
      } else {
        setFileBrowserPreviewKind(null);
        setFileBrowserPreviewContent(null);
      }
      setIsFileBrowserPreviewLoading(false);
      return;
    }

    const previewUrl = buildEnvironmentFileDownloadUrl(normalizedBackendUrl, activeWorkspaceEnvironmentId, previewFileBrowserItem.path);
    if (!previewUrl) {
      setFileBrowserPreviewContent(null);
      setFileBrowserPreviewKind(null);
      setIsFileBrowserPreviewLoading(false);
      return;
    }

    const controller = new AbortController();
    const headers = buildRunnerHeaders(requestHeaders, apiKey.trim());
    setIsFileBrowserPreviewLoading(true);
    setFileBrowserPreviewContent(null);
    setFileBrowserPreviewKind(null);

    fetch(previewUrl, {
      method: "GET",
      headers,
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load preview (${response.status})`);
        }

        if (fileType === "image" || fileType === "video") {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          fileBrowserPreviewObjectUrlRef.current = objectUrl;
          setFileBrowserPreviewKind(fileType);
          setFileBrowserPreviewContent(objectUrl);
          return;
        }

        const text = await response.text();
        setFileBrowserPreviewKind("text");
        setFileBrowserPreviewContent(text.slice(0, 5000));
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setFileBrowserPreviewContent(null);
        setFileBrowserPreviewKind(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsFileBrowserPreviewLoading(false);
        }
      });

    return () => controller.abort();
  }, [
    activeWorkspaceEnvironmentId,
    apiKey,
    currentFileBrowserSource,
    googleDriveConfig,
    githubConfig,
    normalizedBackendUrl,
    oneDriveConfig,
    previewFileBrowserItem,
    requestHeaders,
  ]);

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
        setActiveInputPopup("attach-files");
        return;
      }
      if (shortcutKey === SCHEDULE_SHORTCUT_KEY) {
        event.preventDefault();
        setActiveInputPopup("schedule");
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [disabled, isPreparingRun, showFileBrowserModal, useComputerAgentsMode]);

  const hasCustomEmptyState = turns.length === 0 && emptyState !== undefined && emptyState !== null;
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

  return (
    <div
      ref={rootRef}
      className={`tb-runner-chat ${shouldReserveDocumentPreviewWidth ? "tb-runner-chat-document-preview-open" : ""} ${isPreviewedDocumentImage ? "tb-runner-chat-image-preview-open" : ""} ${isPreviewedDocumentImage && hasPortalDocumentPreview ? "tb-runner-chat-image-preview-portal-open" : ""} ${isPreviewedDocumentImage && !hasPortalDocumentPreview ? "tb-runner-chat-image-preview-local-open" : ""} ${previewedDocumentAttachment && isDocumentPreviewMaximized ? "tb-runner-chat-document-preview-maximized" : ""} ${selectedSubagentDetailPresentation || selectedComputerUseDetailPresentation ? "tb-runner-chat-subagent-detail-open" : ""} ${effectiveSelectedDeepResearchDetailPresentation ? "tb-runner-chat-deep-research-detail-open" : ""} ${className || ""}`.trim()}
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
            {canonicalThreadEnabled && canonicalThread.error && !shouldUseCanonicalThreadSurface ? (
              <div className="tb-canonical-thread-error is-compatibility" role="alert">
                <span>Live observer activity is unavailable: {canonicalThread.error}</span>
                <button type="button" onClick={() => void canonicalThread.refresh().catch(() => undefined)}>Retry</button>
              </div>
            ) : null}
            {shouldUseCanonicalThreadSurface ? (
              <RunnerCanonicalThreadSurface
                projection={canonicalThread.projection}
                connected={canonicalThread.connected}
                reconnecting={canonicalThread.reconnecting}
                loading={canonicalThread.loading}
                error={canonicalThread.error}
                hasContent={hasCanonicalSurfaceContent}
                historyEntries={legacyCompatibilityHistoryEntries}
                tailEntries={legacyCompatibilityTailEntries}
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
                onPermissionDecision={(request, decision) => handlePermissionDecision(
                  adaptRunnerThreadPermissionRequestToRunnerLog(request),
                  decision,
                )}
              />
            ) : turns.map((turn, turnIndex) => {
              const isTurnRunning = isRunningTurnStatus(turn.status);
              const isTurnPermissionAsked = turn.status === "permission_asked";
              const isQueuedTurn = turn.status === "queued";
              const isLatestTurn = turnIndex === turns.length - 1;
              const turnSeconds = getTurnDurationSeconds(turn);
              const { agentMessage, displayedTimelineItems: rawDisplayedTimelineItems } = getTurnTimelineState(turn);
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
              const userPromptContent = hasCustomUserPromptContent ? customUserPromptContent : defaultUserPromptContent;
              const isBtwTurn = turn.presentation === "btw" || normalizedPrompt.toLowerCase().startsWith("/btw");
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
              const visibleTimelineItemCount = visibleTimelineItemCountsByTurn[turn.id];
              const visibleTimelineSourceItems = shouldRenderMetronomeWorkflowPrompt && metronomeWorkflowPromptLog
                ? rawDisplayedTimelineItems.filter((item) => item.kind !== "log" || item.log !== metronomeWorkflowPromptLog)
                : rawDisplayedTimelineItems;
              const revealedTimelineItems =
                visibleTimelineItemCount === undefined
                  ? visibleTimelineSourceItems
                  : visibleTimelineSourceItems.slice(0, visibleTimelineItemCount);
              const isLiveWorkLogPreviewTurn = isTurnRunning && !agentMessage?.message;
              const isExpanded = expandedTurns[turn.id] ?? (isLiveWorkLogPreviewTurn ? false : !isThreadHistoryLoading);
              const visibleWorkLogItemCount = isExpanded
                ? visibleWorkLogItemCountsByTurn[turn.id] ?? RUNNER_WORK_LOG_PAGE_SIZE
                : RUNNER_LIVE_WORK_LOG_PREVIEW_COUNT;
              const firstDisplayedTimelineItemIndex = Math.max(0, revealedTimelineItems.length - visibleWorkLogItemCount);
              const displayedTimelineItems = revealedTimelineItems.slice(firstDisplayedTimelineItemIndex);
              const hasMoreWorkingLogs = isExpanded && firstDisplayedTimelineItemIndex > 0;
              const shouldShowCollapsedLivePreview = false;
              const thinkingStatusPhase =
                thinkingStatusPhaseByTurn[turn.id] ??
                (isTurnRunning && visibleTimelineSourceItems.length > 0 && !agentMessage?.message ? "visible" : "hidden");
              const shouldRenderThinkingStatus =
                isTurnRunning &&
                rawDisplayedTimelineItems.length > 0 &&
                !agentMessage?.message &&
                thinkingStatusPhase !== "hidden" &&
                (isExpanded || displayedTimelineItems.length === 0);
              const isWorkLogsLoading =
                isThreadHistoryLoading &&
                !isTurnRunning &&
                Boolean(agentMessage?.message) &&
                revealedTimelineItems.length === 0;
              const baseDelay = turnIndex * 140;
              const promptStyle = turn.animateOnRender ? getRunnerChatEnterAnimationStyle(baseDelay) : undefined;
              const metaHeaderStyle = turn.animateOnRender ? getRunnerChatEnterAnimationStyle(baseDelay + 40) : undefined;
              const workHeaderStyle = turn.animateOnRender ? getRunnerChatEnterAnimationStyle(baseDelay + 60) : undefined;
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
              const turnComputerLabel = getRunnerComputerDisplayLabel(turnEnvironmentLabel);
              const liveWorkSummary = isTurnRunning
                ? getRunnerTurnLiveWorkSummary(turn)
                : null;
              const workLabel = isWorkLogsLoading
                ? `${turnAgentLabel} loading working logs...`
                : turn.status === "permission_asked"
                  ? `${turnAgentLabel} needs permission`
                  : isTurnRunning
                  ? liveWorkSummary
                    ? `${liveWorkSummary} · ${formatElapsedDurationLabel(turnSeconds)}`
                    : `${turnAgentLabel} working · ${formatElapsedDurationLabel(turnSeconds)}`
                  : `${turnAgentLabel} worked for ${formatElapsedDurationLabel(turnSeconds)}`;
              const workComputerLabel = (
                <span className="tb-work-computer-label" title={turnComputerLabel}>
                  <span className="tb-work-computer-label-icons" aria-hidden="true">
                    <LucideMonitor className="tb-work-computer-label-icon" strokeWidth={1.55} />
                  </span>
                  <span className="tb-work-computer-label-text">{turnComputerLabel}</span>
                </span>
              );
              const shouldRenderWorkSection = isTurnRunning || isTurnPermissionAsked || revealedTimelineItems.length > 0 || isWorkLogsLoading;
              const legacyTurnProjection = legacyTurnProjectionsById.get(turn.id) || null;
              const legacyTurnRun = legacyTurnProjection
                ? Object.values(legacyTurnProjection.runsById)[0] || null
                : null;
              const effectiveLegacyTurnProjection = legacyTurnProjection && legacyTurnRun && liveWorkSummary
                ? {
                    ...legacyTurnProjection,
                    runsById: {
                      ...legacyTurnProjection.runsById,
                      [legacyTurnRun.id]: { ...legacyTurnRun, currentSummary: liveWorkSummary },
                    },
                  }
                : legacyTurnProjection;
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
                  <RunnerWorkLogEntry
                    log={metronomeWorkflowPromptLog}
                    backendUrl={normalizedBackendUrl}
                    environmentId={scopedActiveThreadEnvironmentId || selectedEnvironment?.id || environmentId || null}
                    requestHeaders={requestHeaders}
                    activeTaskPreviewId={threadTaskPreview?.taskId || null}
                    availableAgents={agents}
                    availableEnvironments={availableEnvironments}
                    availableProjects={availableProjects}
                    onPreviewDocument={(attachment) => toggleDocumentAttachmentPreview(attachment)}
                    onWorkspacePathClick={(path) => handleSummaryWorkspacePathClick(turn, path, "working_log")}
                    onPermissionDecision={handlePermissionDecision}
                    onTaskPreviewClick={onTaskPreviewClick}
                    onAgentPreviewClick={(agent) => {
                      if (typeof onAgentTurnClick !== "function") return;
                      onAgentTurnClick({
                        turnId: turn.id,
                        agentId: agent.agentId || undefined,
                        agentName: agent.agentName || undefined,
                      });
                    }}
                    onEnvironmentPreviewClick={(environment) => {
                      const normalizedEnvironmentId = String(environment.environmentId || "").trim();
                      if (!normalizedEnvironmentId) return;
                      onResourcePreviewClick?.({
                        id: normalizedEnvironmentId,
                        name: String(environment.environmentName || "Environment").trim() || "Environment",
                        resourceType: "environment",
                        description: null,
                        model: null,
                        category: null,
                        projectId: null,
                        projectName: null,
                        isDefault: false,
                        status: null,
                      });
                    }}
                    onProjectPreviewClick={(project) => {
                      const normalizedProjectId = String(project.projectId || "").trim();
                      if (!normalizedProjectId) return;
                      onResourcePreviewClick?.({
                        id: normalizedProjectId,
                        name: String(project.projectName || "Project").trim() || "Project",
                        resourceType: "project",
                        description: null,
                        model: null,
                        category: null,
                        projectId: normalizedProjectId,
                        projectName: String(project.projectName || "").trim() || null,
                        isDefault: false,
                        status: null,
                      });
                    }}
                    onOpenTaskList={onOpenTaskList}
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
                const isCommunicatorBtwTurn = turn.messageMetadata?.source === "thread_v2_communicator";
                const routingReceiptLabel = typeof turn.messageMetadata?.routingReceiptLabel === "string"
                  ? turn.messageMetadata.routingReceiptLabel.trim()
                  : "";
                return (
                  <div key={turn.id} className={`tb-turn tb-turn-btw ${isCommunicatorBtwTurn ? "is-communicator" : ""}`.trim()}>
                    {userMessageTime}
                    <div className={`tb-btw-turn-card ${isCommunicatorBtwTurn ? "is-communicator" : ""}`.trim()} style={promptStyle}>
                      {isCommunicatorBtwTurn ? (
                        <div className="tb-btw-communicator-header">
                          <span className="tb-btw-communicator-avatar" aria-hidden="true"><LucideMessageCircle strokeWidth={1.7} /></span>
                          <span>Communicator</span>
                        </div>
                      ) : null}
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
                          {routingReceiptLabel ? (
                            <div className="tb-thread-routing-receipt is-success" role="status">
                              <LucideCheck className="tb-thread-routing-receipt-icon" strokeWidth={1.7} />
                              <span>{routingReceiptLabel}</span>
                            </div>
                          ) : null}
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

                    {!isQueuedTurn && !shouldRenderWorkSection ? (
                      <div className="tb-turn-meta" style={metaHeaderStyle}>
                        {renderTurnAgentTrigger(turn, turnAgentLabel, turnAgentPhotoUrl)}
                        <div className="tb-turn-environment-pill">
                          <LucideCloud className="tb-turn-environment-icon" />
                          <span className="tb-turn-environment-label">{turnEnvironmentLabel}</span>
                        </div>
                      </div>
                    ) : null}

                    {shouldRenderWorkSection ? (
                      <>
                        <button
                          type="button"
                          className="tb-work-header"
                          style={workHeaderStyle}
                          aria-expanded={isExpanded}
                          onClick={() => toggleWorkingLogs(turn.id, isExpanded)}
                        >
                          <span className="tb-work-label">
                            <span>{workLabel}</span>
                            {isExpanded ? <IconChevronUp className="tb-chevron" /> : <IconChevronDown className="tb-chevron" />}
                          </span>
                          {workComputerLabel}
                        </button>

                        <div className={`tb-work-collapse ${isExpanded ? "is-expanded" : ""} ${isExpanded || shouldShowCollapsedLivePreview ? "" : "collapsed"}`.trim()}>
                          {isExpanded || shouldShowCollapsedLivePreview ? (
                            <div className="tb-work-collapse-inner">
                              <div className="agent-steps-container">
                                {hasMoreWorkingLogs ? (
                                  <div className="agent-step-item tb-work-load-more-item">
                                    <div className="agent-step-content">
                                      <button
                                        type="button"
                                        className="tb-work-load-more-button"
                                        onClick={() => loadMoreWorkingLogs(turn.id, revealedTimelineItems.length)}
                                      >
                                        <LucidePlus className="tb-work-load-more-icon" strokeWidth={1.8} />
                                        Load more...
                                      </button>
                                    </div>
                                  </div>
                                ) : null}
                                {displayedTimelineItems.map((item, index) => {
                                  const timelineIndex = firstDisplayedTimelineItemIndex + index;
                                  const content = renderTimelineItem(turn, item, timelineIndex);
                                  if (!content) return null;
                                  return (
                                    <div
                                      key={timelineItemKey(turn.id, timelineIndex, item)}
                                      className="agent-step-item"
                                      style={shouldAnimateTimelineRows ? getRunnerChatEnterAnimationStyle(baseDelay + 80 + index * 45) : undefined}
                                    >
                                      <div className="agent-step-content">{content}</div>
                                    </div>
                                  );
                                })}
                                {shouldRenderThinkingStatus ? (
                                  <div
                                    className={`agent-step-item tb-thinking-status-transition ${thinkingStatusPhase === "fading" ? "is-fading" : ""}`.trim()}
                                    style={shouldAnimateTimelineRows ? getRunnerChatEnterAnimationStyle(baseDelay + 80 + displayedTimelineItems.length * 45) : undefined}
                                  >
                                    <div className="agent-step-content">
                                      <InlineStatusLogBox
                                        label="Thinking..."
                                        icon={<LucideTerminal className="tb-log-card-small-icon" strokeWidth={1.5} />}
                                        pending
                                      />
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </>
                    ) : null}

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

                  {isQueuedTurn ? <RunnerPageQueueReceipt /> : null}

                  {!isQueuedTurn && !shouldRenderWorkSection ? (
                    <div className="tb-turn-meta" style={metaHeaderStyle}>
                      {renderTurnAgentTrigger(turn, turnAgentLabel, turnAgentPhotoUrl)}
                      <div className="tb-turn-environment-pill">
                        <LucideCloud className="tb-turn-environment-icon" />
                        <span className="tb-turn-environment-label">{turnEnvironmentLabel}</span>
                      </div>
                    </div>
                  ) : null}

                  {shouldRenderWorkSection && effectiveLegacyTurnProjection && legacyTurnRun ? (
                    <div className="tb-turn-run-activity" style={workHeaderStyle}>
                      <RunnerThreadRunActivityCard
                        run={effectiveLegacyTurnProjection.runsById[legacyTurnRun.id] || legacyTurnRun}
                        projection={effectiveLegacyTurnProjection}
                        fallbackAgentName={turnAgentLabel}
                        fallbackWorkspaceName={effectiveWorkspaceSelectorMode === "projects" ? displayedWorkspaceLabel : turnEnvironmentLabel}
                        renderAction={renderCanonicalThreadAction}
                        onPermissionDecision={(request, decision) => handlePermissionDecision(
                          adaptRunnerThreadPermissionRequestToRunnerLog(request),
                          decision,
                        )}
                      />
                    </div>
                  ) : null}

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

      <div className="tb-input-shell">
        <div className="tb-input-width">
          <div className="embedded-runner-input">
            <div
              className={`task-input-box ${privateMode ? "task-input-box-private" : ""} ${stagedComposerToneValue ? `task-input-box-thread-context task-input-box-thread-context-${stagedComposerToneValue}` : ""}`.trim()}
            >
              {stagedAdCreationCommand ? (
                <PlatformPopupSurface className="tb-popup-menu-main tb-ad-creation-popup" animation="up-in" role="dialog" aria-label="Create Ad settings">
                  <div className="tb-ad-creation-popup-header">
                    <div className="tb-ad-creation-popup-title">Create Ad</div>
                    <button
                      type="button"
                      className="tb-ad-creation-close-button"
                      onClick={() => setStagedAdCreationCommand(null)}
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

              {attachments.length > 0 ? (
                <div className="runner-attachments">
                  {attachments.map((attachment) => (
                    <RunnerAttachmentPreviewChip
                      key={attachment.id}
                      attachment={attachment}
                      authenticatedFetchHeaders={authenticatedAttachmentFetchHeaders}
                      backendUrl={normalizedBackendUrl}
                      removable
                      onRemove={() => removeAttachment(attachment.id)}
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
                className={`tb-composer-textarea-shell ${hasStagedComposerCommand ? "tb-composer-textarea-shell-staged" : ""}`.trim()}
                style={
                  hasStagedComposerCommand
                    ? ({
                        "--tb-staged-thread-command-offset": stagedComposerOffsetValue,
                    } as CSSProperties)
                    : undefined
                }
              >
                {showSlashCommandPopup ? (
                  <PlatformPopupSurface className="tb-popup-menu-main tb-popup-menu-slash" animation="up-in">
                    {filteredSlashCommandItems.length > 0 ? (
                      filteredSlashCommandItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="tb-popup-row tb-popup-row-core-action"
                          onMouseDown={(event) => {
                            event.preventDefault();
                          }}
                          onClick={() => {
                            item.stage();
                            window.requestAnimationFrame(() => {
                              textareaRef.current?.focus();
                            });
                          }}
                        >
                          {item.icon}
                          <span className="tb-popup-label">{item.command}</span>
                          <span className="tb-popup-value">{item.description}</span>
                        </button>
                      ))
                    ) : (
                      <div className="tb-popup-menu-slash-empty">
                        <div className="tb-popup-empty-state">No slash commands match that input.</div>
                      </div>
                    )}
                  </PlatformPopupSurface>
                ) : null}
                {hasStagedComposerCommand ? (
                  <span
                    className={`tb-staged-thread-command ${stagedComposerToneValue ? `tb-staged-thread-command-${stagedComposerToneValue}` : ""}`.trim()}
                  >
                    {stagedComposerLabel}
                  </span>
                ) : null}
                <textarea
                  ref={textareaRef}
                  rows={1}
                  className={`sidebar-textarea ${hasStagedComposerCommand ? "sidebar-textarea-staged" : ""}`.trim()}
                  value={input}
                  onChange={handleInputChange}
                  onPaste={handleInputPaste}
                  onSelect={handleInputSelectionChange}
                  onClick={handleInputSelectionChange}
                  onKeyUp={handleInputSelectionChange}
                  placeholder={hasStagedComposerCommand ? "" : placeholder}
                  onKeyDown={handleKeyDown}
                  readOnly={Boolean(stagedThreadContextCommand && !textareaAllowsPromptAfterStagedCommand)}
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
                            className="tb-popup-row"
                            onClick={() => openFileBrowserModal("github")}
                          >
                            <IconGithub className="tb-popup-icon tb-popup-brand-icon" />
                            <span className="tb-popup-label">{githubConnected ? "GitHub" : "Connect GitHub"}</span>
                          </button>
                          <button
                            type="button"
                            className="tb-popup-row"
                            onClick={() => openFileBrowserModal("google-drive")}
                          >
                            <IconGoogleDrive className="tb-popup-icon tb-popup-brand-icon" />
                            <span className="tb-popup-label">{googleDriveConnected ? "Google Drive" : "Connect Google Drive"}</span>
                          </button>
                          <button
                            type="button"
                            className="tb-popup-row tb-popup-row-divider"
                            onClick={() => openFileBrowserModal("notion")}
                          >
                            <IconNotion className="tb-popup-icon tb-popup-brand-icon" />
                            <span className="tb-popup-label">{notionConnected ? "Notion" : "Connect Notion"}</span>
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
                                        setSelectedGoogleDriveFileIds((current) => toggleFileSelection(current, item.id));
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
                                        setSelectedOneDriveFileIds((current) => toggleFileSelection(current, item.id));
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
                                  min={formatDateTimeLocalValue(new Date())}
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
                            <div className="platform-switch" role="group" aria-label="Attachment source">
                              <button type="button" className="platform-switch__option is-active" onClick={handleUploadNewFilesClick}>
                                Upload New
                              </button>
                              <button
                                type="button"
                                className="platform-switch__option"
                                onClick={() => {
                                  openFileBrowserModal("workspace");
                                }}
                              >
                                From Workspace
                              </button>
                            </div>
                          </div>
                          <div className="tb-popup-panel-section tb-popup-panel-section-attach-body tb-popup-panel-section-divider tb-popup-panel-section-divider-spaced">
                            <button
                              type="button"
                              className={`tb-popup-dropzone ${isDraggingOver ? "dragging" : ""}`}
                              onClick={handleUploadNewFilesClick}
                              onDragOver={(event) => {
                                event.preventDefault();
                                setIsDraggingOver(true);
                              }}
                              onDragLeave={() => setIsDraggingOver(false)}
                              onDrop={(event) => {
                                event.preventDefault();
                                setIsDraggingOver(false);
                                handleDroppedLocalFiles(Array.from(event.dataTransfer.files || []));
                              }}
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
                    {renderContextIndicatorControl()}

                    {composerBeforeAgentControl ? (
                      <div className="tb-composer-leading-control">{composerBeforeAgentControl}</div>
                    ) : null}

                    {renderAgentSelectorControl()}

                    {scheduledTask ? (
                      <div className="tb-schedule-chip">
                        <LucideCalendar className="tb-schedule-chip-icon" strokeWidth={1.75} />
                        <span className="tb-schedule-chip-label">{formatScheduleChipLabel(scheduledTask)}</span>
                        <button type="button" className="tb-schedule-chip-clear" onClick={clearScheduledTask} aria-label="Clear schedule">
                          <LucideX className="tb-schedule-chip-clear-icon" strokeWidth={1.75} />
                        </button>
                      </div>
                    ) : null}

	                    <div className="task-input-spacer" />

	                    {renderEnvironmentSelectorControl()}
                    {renderVoiceModeControl(true)}

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
	                    {renderContextIndicatorControl()}
	                    <div className="task-input-spacer" />
                    {renderVoiceModeControl(false)}
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
                {renderVoiceModeStatusBar()}
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
                    {renderComposerOrganizationSelector()}
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

      <RunnerReportIssueDialog
        open={Boolean(reportIssueTurn)}
        type={reportIssueType}
        message={reportIssueMessage}
        error={reportIssueError}
        submitting={isReportIssueSubmitting}
        onTypeChange={(nextType) => {
          setReportIssueType(nextType);
          setReportIssueError("");
        }}
        onMessageChange={(message) => {
          setReportIssueMessage(message);
          setReportIssueError("");
        }}
        onSubmit={submitReportIssue}
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
        onSourceChange={switchFileBrowserSource}
        connections={{
          "google-drive": {
            connected: googleDriveConnected,
            onConnect: googleDriveConfig?.onConnect,
            onDisconnect: googleDriveConfig?.onDisconnect,
          },
          notion: {
            connected: notionConnected,
            onConnect: notionConfig?.onConnect,
            onDisconnect: notionConfig?.onDisconnect,
          },
          "one-drive": {
            connected: oneDriveConnected,
            onConnect: oneDriveConfig?.onConnect,
            onDisconnect: oneDriveConfig?.onDisconnect,
          },
          github: {
            connected: githubConnected,
            onConnect: githubConfig?.onConnect,
            onDisconnect: githubConfig?.onDisconnect,
          },
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
        renderItem={renderFileBrowserItem}
        previewItem={previewFileBrowserItem}
        previewContent={fileBrowserPreviewContent}
        previewKind={fileBrowserPreviewKind}
        isPreviewLoading={isFileBrowserPreviewLoading}
        renderPreviewIcon={(item) => renderBrowserFileIcon(item, "tb-file-browser-preview-glyph")}
        selectedItemCount={selectedFileBrowserIds.length}
        selectedItemLabel={selectedFileBrowserLabel}
        isAttaching={isFileBrowserAttaching}
        onAttach={handleFileBrowserAttach}
        onClose={closeFileBrowserModal}
        onApiKeyPromptClose={closeFileBrowserApiKeyPrompt}
      />
    </div>
  );
}

export type { RunnerLog };

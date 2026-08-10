import type {
  CSSProperties,
  RefObject,
} from "react";
import {
  Eraser as LucideEraser,
  GitBranch as LucideGitBranch,
  MessageCircle as LucideMessageCircle,
  Minimize2 as LucideMinimize2,
} from "lucide-react";
import {
  PlatformPopupSurface,
  type PlatformPopupAnimation,
} from "../../platform-ui/components/composite/popup/index.js";
import { PlatformSecondaryButton } from "../../platform-ui/components/ui/button/index.js";
import { PlatformHoverLabel } from "../../platform-ui/components/ui/icon-button/index.js";
import { renderComposerPopupPortal } from "./composer-popup.js";
import {
  EMPTY_THREAD_CONTEXT_CATEGORIES,
  buildContextIndicatorTitle,
  deriveThreadContextDisplayMetrics,
  formatCompactTokenCount,
  getContextCategoryDisplayTokens,
  threadContextCategoryColor,
  type RunnerChatThreadContext,
  type RunnerChatThreadContextAction,
  type RunnerChatThreadContextAvailableActions,
  type RunnerChatThreadContextCategoryKey,
  type RunnerChatThreadContextDetails,
} from "./thread-context-utils.js";

type ElementRef<T extends HTMLElement> = RefObject<T | null>;

const CONTEXT_CATEGORY_ORDER: RunnerChatThreadContextCategoryKey[] = [
  "system_prompt",
  "skills",
  "messages",
  "autocompact_buffer",
  "free_space",
  "other",
];

export interface RunnerThreadContextControlProps {
  actionAvailability: RunnerChatThreadContextAvailableActions;
  actionLoading: RunnerChatThreadContextAction | null;
  animation: PlatformPopupAnimation | false;
  buttonRef: ElementRef<HTMLButtonElement>;
  context: RunnerChatThreadContext | null;
  currentThreadId: string | null;
  details: RunnerChatThreadContextDetails | null;
  detailsError: string | null;
  detailsLoading: boolean;
  hasApiKey: boolean;
  hasAssistantAnswer: boolean;
  hasMessages: boolean;
  indicatorLoading: boolean;
  onAction: (action: RunnerChatThreadContextAction) => void;
  onIndicatorClick: () => void;
  onRefresh: () => void;
  open: boolean;
  popupRef: ElementRef<HTMLDivElement>;
  popupStyle: CSSProperties | null;
}

function resolveEffectiveActionAvailability({
  actionAvailability,
  context,
  currentThreadId,
  details,
  hasAssistantAnswer,
  hasMessages,
}: Pick<
  RunnerThreadContextControlProps,
  | "actionAvailability"
  | "context"
  | "currentThreadId"
  | "details"
  | "hasAssistantAnswer"
  | "hasMessages"
>): RunnerChatThreadContextAvailableActions {
  const hasReceivedFirstAssistantAnswer =
    Boolean(details?.sessionId || context?.sessionId)
    || hasAssistantAnswer;
  const hasBackendManagementAction =
    actionAvailability.compact
    || actionAvailability.clear
    || actionAvailability.fork;
  const canManage =
    hasReceivedFirstAssistantAnswer
    || hasBackendManagementAction;

  return {
    compact: canManage,
    clear: canManage,
    btw: Boolean(currentThreadId) && hasMessages,
    fork: canManage,
  };
}

function RunnerThreadContextPopup({
  actionAvailability,
  actionLoading,
  animation,
  context,
  currentThreadId,
  details,
  detailsError,
  detailsLoading,
  hasApiKey,
  hasAssistantAnswer,
  hasMessages,
  onAction,
  onRefresh,
}: Omit<
  RunnerThreadContextControlProps,
  | "buttonRef"
  | "indicatorLoading"
  | "onIndicatorClick"
  | "open"
  | "popupRef"
  | "popupStyle"
>) {
  if (!hasApiKey) {
    return (
      <PlatformPopupSurface
        className="tb-popup-menu-context"
        animation={animation}
      >
        <div className="tb-popup-menu-title tb-popup-menu-title-context">
          Thread Context
        </div>
        <div className="tb-popup-note">
          <div className="tb-popup-note-title">API key required</div>
          <div className="tb-popup-note-body">
            Enter an API key in the playground sidebar to inspect and manage
            thread context.
          </div>
        </div>
      </PlatformPopupSurface>
    );
  }

  const resolvedContext = details || context;
  const displayContext: RunnerChatThreadContextDetails =
    details
      ? details
      : {
          ...(context || {
            threadId: currentThreadId || "",
            sessionId: null,
            model: currentThreadId
              ? "Waiting for context data"
              : "No active thread",
            maxTokens: 0,
            usedTokens: 0,
            remainingTokens: 0,
            remainingRatio: 0,
            source: "empty",
            exact: false,
          }),
          categories: EMPTY_THREAD_CONTEXT_CATEGORIES,
        };
  const metrics = deriveThreadContextDisplayMetrics(displayContext);
  const categories = [
    ...(details?.categories || EMPTY_THREAD_CONTEXT_CATEGORIES),
  ]
    .sort(
      (left, right) =>
        CONTEXT_CATEGORY_ORDER.indexOf(left.key)
        - CONTEXT_CATEGORY_ORDER.indexOf(right.key),
    )
    .filter(
      (category) =>
        category.tokens > 0
        || category.key === "free_space",
    );
  const hasUsage = Boolean(resolvedContext) && displayContext.maxTokens > 0;
  const usedPercent = Math.round(
    (metrics.usedTokens / Math.max(displayContext.maxTokens, 1)) * 100,
  );
  const effectiveActionAvailability = resolveEffectiveActionAvailability({
    actionAvailability,
    context,
    currentThreadId,
    details,
    hasAssistantAnswer,
    hasMessages,
  });

  return (
    <PlatformPopupSurface
      className="tb-popup-menu-context"
      animation={animation}
    >
      <div className="tb-popup-menu-title tb-popup-menu-title-context">
        <span>Thread Context</span>
        {hasUsage ? (
          <span className="tb-context-panel-tokens">
            {formatCompactTokenCount(metrics.usedTokens)}/
            {formatCompactTokenCount(displayContext.maxTokens)} tokens (
            {usedPercent}%)
          </span>
        ) : null}
      </div>
      {detailsLoading ? (
        <div className="tb-popup-loading-row">
          <span className="tb-popup-loading-spinner" />
          <span className="tb-popup-loading-label">
            Loading native thread context…
          </span>
        </div>
      ) : detailsError ? (
        <div className="tb-popup-note">
          <div className="tb-popup-note-title">Context unavailable</div>
          <div className="tb-popup-note-body">{detailsError}</div>
          <PlatformSecondaryButton
            size="large"
            type="button"
            className="tb-popup-action tb-popup-action-secondary tb-context-panel-retry"
            onClick={onRefresh}
          >
            Retry
          </PlatformSecondaryButton>
        </div>
      ) : (
        <div className="tb-context-panel">
          <div className="tb-context-panel-bar" aria-hidden="true">
            {categories
              .filter(
                (category) =>
                  getContextCategoryDisplayTokens(category, metrics) > 0,
              )
              .map((category) => (
                <span
                  key={category.key}
                  className={`tb-context-panel-bar-segment tb-context-panel-bar-segment-${category.kind === "buffer" ? "used" : category.kind}`}
                  style={
                    {
                      "--tb-context-segment-size": String(
                        displayContext.maxTokens > 0
                          ? getContextCategoryDisplayTokens(category, metrics)
                            / displayContext.maxTokens
                          : 0,
                      ),
                      "--tb-context-segment-color":
                        threadContextCategoryColor(category),
                    } as CSSProperties
                  }
                />
              ))}
          </div>

          <div className="tb-context-panel-list">
            {categories.map((category) => (
              <div key={category.key} className="tb-context-panel-row">
                <span className="tb-context-panel-row-main">
                  <span
                    className="tb-context-panel-row-swatch"
                    style={{
                      background: threadContextCategoryColor(category),
                    }}
                  />
                  <span className="tb-context-panel-row-label">
                    {category.label}
                  </span>
                </span>
                <span className="tb-context-panel-row-value">
                  {!hasUsage && category.key === "free_space"
                    ? "100%"
                    : `${formatCompactTokenCount(
                        getContextCategoryDisplayTokens(category, metrics),
                      )} tokens`}
                </span>
              </div>
            ))}
          </div>

          <div className="tb-context-panel-actions">
            <button
              type="button"
              className="tb-context-panel-action"
              disabled={
                !effectiveActionAvailability.compact
                || actionLoading !== null
              }
              onClick={() => onAction("compact")}
            >
              <span className="tb-context-panel-action-single">
                <LucideMinimize2
                  className="tb-context-panel-action-icon"
                  strokeWidth={1.75}
                />
                <span>/compact</span>
              </span>
            </button>

            <button
              type="button"
              className="tb-context-panel-action"
              disabled={
                !effectiveActionAvailability.clear
                || actionLoading !== null
              }
              onClick={() => onAction("clear")}
            >
              <span className="tb-context-panel-action-single">
                <LucideEraser
                  className="tb-context-panel-action-icon"
                  strokeWidth={1.75}
                />
                <span>/clear</span>
              </span>
            </button>

            <button
              type="button"
              className="tb-context-panel-action"
              disabled={
                !effectiveActionAvailability.btw
                || actionLoading !== null
              }
              onClick={() => onAction("btw")}
            >
              <span className="tb-context-panel-action-single">
                <LucideMessageCircle
                  className="tb-context-panel-action-icon"
                  strokeWidth={1.75}
                />
                <span>/btw</span>
              </span>
            </button>

            <button
              type="button"
              className="tb-context-panel-action"
              disabled={
                !effectiveActionAvailability.fork
                || actionLoading !== null
              }
              onClick={() => onAction("fork")}
            >
              <span className="tb-context-panel-action-single">
                <LucideGitBranch
                  className="tb-context-panel-action-icon"
                  strokeWidth={1.75}
                />
                <span>/fork</span>
              </span>
            </button>
          </div>
        </div>
      )}
    </PlatformPopupSurface>
  );
}

export function RunnerThreadContextControl(
  props: RunnerThreadContextControlProps,
) {
  const {
    buttonRef,
    context,
    currentThreadId,
    details,
    indicatorLoading,
    onIndicatorClick,
    open,
    popupRef,
    popupStyle,
  } = props;
  const indicatorContext = details || context;
  const indicatorMetrics =
    deriveThreadContextDisplayMetrics(indicatorContext);
  const progress = Math.max(
    0,
    Math.min(1, indicatorMetrics.usedRatio),
  );
  const title = buildContextIndicatorTitle(
    indicatorContext,
    Boolean(currentThreadId),
    indicatorLoading,
  );

  return (
    <div className="tb-selector-anchor tb-context-indicator-anchor">
      <PlatformHoverLabel
        className="tb-context-indicator-hover-label"
        label="Context"
        placement="top"
      >
        <button
          ref={buttonRef}
          type="button"
          className={`tb-context-indicator-button ${open ? "active" : ""} ${indicatorLoading ? "loading" : ""}`.trim()}
          onClick={onIndicatorClick}
          aria-label="Conversation context remaining"
          title={title}
        >
          <span
            className="tb-context-indicator-ring"
            style={
              {
                "--tb-context-progress": String(progress),
              } as CSSProperties
            }
          />
        </button>
      </PlatformHoverLabel>

      {renderComposerPopupPortal(
        open ? (
          <div ref={popupRef} className="tb-composer-popup-measure">
            <RunnerThreadContextPopup {...props} />
          </div>
        ) : null,
        popupStyle,
      )}
    </div>
  );
}

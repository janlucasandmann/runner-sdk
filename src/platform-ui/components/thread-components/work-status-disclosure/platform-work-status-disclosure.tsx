import {
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { type CSSProperties, type ReactNode, useEffect, useId, useState } from "react";

import { PlatformSecondaryButton } from "../../ui/button/index.js";
import { DotLoader } from "../../ui/dot-loader/index.js";

const COLLAPSED_LIVE_ITEM_COUNT = 1;
const COLLAPSED_ITEM_TRANSITION_MS = 220;

export interface RunnerWorkStatusItem {
  content: ReactNode;
  isToolCall?: boolean;
  key: string;
  style?: CSSProperties;
}

export interface RunnerWorkStatusDisclosureProps {
  expanded: boolean;
  hasMore?: boolean;
  headline: string;
  headerStyle?: CSSProperties;
  items: readonly RunnerWorkStatusItem[];
  live?: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onLoadMore?: () => void;
  showCollapsedPreview?: boolean;
}

/**
 * Compact, controlled disclosure for one agent run's live status and raw work
 * log. The parent owns expansion so streaming and summary lifecycle events can
 * collapse the log without the component maintaining a second source of truth.
 */
export function RunnerWorkStatusDisclosure({
  expanded,
  hasMore = false,
  headline,
  headerStyle,
  items,
  live = false,
  onExpandedChange,
  onLoadMore,
  showCollapsedPreview = true,
}: RunnerWorkStatusDisclosureProps) {
  const contentId = useId();
  let latestItem: RunnerWorkStatusItem | null = null;
  for (let index = items.length - COLLAPSED_LIVE_ITEM_COUNT; index >= 0; index -= 1) {
    if (items[index]?.isToolCall) {
      latestItem = items[index] || null;
      break;
    }
  }
  const [retainedTail, setRetainedTail] = useState<{
    current: RunnerWorkStatusItem | null;
    previous: RunnerWorkStatusItem | null;
    revision: number;
  }>(() => ({ current: latestItem, previous: null, revision: 0 }));

  if (latestItem && latestItem.key !== retainedTail.current?.key) {
    setRetainedTail({
      current: latestItem,
      previous: retainedTail.current,
      revision: retainedTail.revision + 1,
    });
  }

  useEffect(() => {
    if (!latestItem || latestItem.key !== retainedTail.current?.key || latestItem === retainedTail.current) {
      return;
    }
    setRetainedTail((current) => (
      current.current?.key === latestItem.key
        ? { ...current, current: latestItem }
        : current
    ));
  }, [latestItem, retainedTail.current]);

  useEffect(() => {
    if (!retainedTail.previous) {
      return undefined;
    }
    const transitionRevision = retainedTail.revision;
    const timer = window.setTimeout(() => {
      setRetainedTail((current) => (
        current.revision === transitionRevision
          ? { ...current, previous: null }
          : current
      ));
    }, COLLAPSED_ITEM_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [retainedTail.previous, retainedTail.revision]);

  const retainedLatestItem = latestItem || retainedTail.current;
  const exitingItem = retainedTail.previous?.key !== retainedLatestItem?.key
    ? retainedTail.previous
    : null;
  const hasContent = hasMore || items.length > 0 || Boolean(retainedLatestItem);
  const HeaderTag = hasContent ? "button" : "div";
  const showCollapsedTail = showCollapsedPreview && !expanded && Boolean(retainedLatestItem);

  return (
    <div
      className={`tb-turn-work-section ${expanded && hasContent ? "is-expanded" : "is-collapsed"}`}
    >
      <HeaderTag
        {...(hasContent
          ? {
              "aria-controls": contentId,
              "aria-expanded": expanded,
              onClick: () => onExpandedChange(!expanded),
              type: "button" as const,
            }
          : {})}
        className={`tb-work-header ${hasContent ? "" : "is-static"}`.trim()}
        style={headerStyle}
      >
        <span className={`tb-work-label ${live ? "is-live" : ""}`.trim()}>
          {live ? (
            <span
              className="tb-log-inline-status-spinner-slot tb-work-status-loader"
              aria-hidden="true"
            >
              <DotLoader
                dotCount={9}
                dotSize={3}
                gap={2}
                className="tb-log-inline-status-dot-loader"
              />
            </span>
          ) : null}
          <span
            key={headline}
            className="tb-work-label-copy"
            aria-live={live ? "polite" : "off"}
          >
            {headline}
          </span>
          {hasContent ? (
            expanded ? (
              <ChevronUp className="tb-chevron" strokeWidth={1.8} />
            ) : (
              <ChevronDown className="tb-chevron" strokeWidth={1.8} />
            )
          ) : null}
        </span>
      </HeaderTag>

      {showCollapsedTail ? (
        <div className="tb-work-live-tail" data-testid="work-status-live-tail">
          <div className="tb-work-live-tail-stack">
            {exitingItem ? (
              <div
                key={`exiting:${exitingItem.key}:${retainedTail.revision}`}
                className="tb-work-live-tail-transition-item is-exiting"
                aria-hidden="true"
              >
                <div className="tb-turn-work-logs">
                  <div className="agent-steps-container">
                    <div className="agent-step-item">
                      <div className="agent-step-content">{exitingItem.content}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            {retainedLatestItem ? (
              <div
                key={`current:${retainedLatestItem.key}`}
                className="tb-work-live-tail-transition-item is-entering"
              >
                <div className="tb-turn-work-logs">
                  <div className="agent-steps-container">
                    <div className="agent-step-item">
                      <div className="agent-step-content">{retainedLatestItem.content}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {hasContent ? (
        <div
          id={contentId}
          className={`tb-work-collapse ${expanded ? "is-expanded" : "collapsed"}`}
          aria-hidden={!expanded}
        >
          <div className="tb-work-collapse-inner">
            <div className="tb-turn-work-logs">
              <div className="agent-steps-container">
                {hasMore && onLoadMore ? (
                  <div className="agent-step-item tb-work-load-more-item">
                    <div className="agent-step-content">
                      <PlatformSecondaryButton
                        className="tb-work-load-more-button"
                        size="small"
                        onClick={onLoadMore}
                      >
                        <Plus strokeWidth={1.8} />
                        Load more...
                      </PlatformSecondaryButton>
                    </div>
                  </div>
                ) : null}
                {items.map((item) => (
                  <div key={item.key} className="agent-step-item" style={item.style}>
                    <div className="agent-step-content">{item.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

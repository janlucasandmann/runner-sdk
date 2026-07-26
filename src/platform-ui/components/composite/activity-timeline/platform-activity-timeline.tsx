import type { ElementType, ReactNode } from "react";

import {
  PlatformCommentCard,
  PlatformCommentComposer,
  type PlatformCommentActions,
  type PlatformCommentComposerProps,
  type PlatformCommentReply,
  type PlatformCommentReplyComposerProps,
} from "../comments/index.js";
import { PlatformEmptyState } from "../empty-state/index.js";

export type PlatformActivityTone =
  | "neutral"
  | "created"
  | "status"
  | "thread"
  | "comment";

export type PlatformActivityReply = PlatformCommentReply;
export type PlatformActivityReplyComposerProps = PlatformCommentReplyComposerProps;
export type PlatformActivityItemActions = PlatformCommentActions;

export interface PlatformActivityItem {
  id: string;
  summary: ReactNode;
  timestamp?: ReactNode;
  trailing?: ReactNode;
  avatar?: ReactNode;
  icon?: ElementType;
  content?: ReactNode;
  tone?: PlatformActivityTone;
  onActivate?: () => void;
  ariaLabel?: string;
  replies?: readonly PlatformActivityReply[];
  replyComposer?: PlatformActivityReplyComposerProps;
  actions?: PlatformActivityItemActions;
}

export type PlatformActivityComposerProps = PlatformCommentComposerProps;

export interface PlatformActivityTimelineProps {
  title?: ReactNode;
  headerActions?: ReactNode;
  items?: readonly PlatformActivityItem[];
  composer?: PlatformActivityComposerProps;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  emptyIcon?: ElementType;
  className?: string;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

function PlatformActivityTimelineItem({ item }: { item: PlatformActivityItem }) {
  const Icon = item.icon;
  const interactive = typeof item.onActivate === "function";

  if (item.content) {
    return (
      <li
        className={joinClassNames(
          "platform-activity-timeline__item",
          "has-content",
          `is-${item.tone || "comment"}`,
        )}
      >
        <PlatformCommentCard
          author={item.summary}
          timestamp={item.timestamp}
          avatar={item.avatar}
          content={item.content}
          replies={item.replies}
          replyComposer={item.replyComposer}
          actions={item.actions}
        />
      </li>
    );
  }

  return (
    <li
      className={joinClassNames(
        "platform-activity-timeline__item",
        `is-${item.tone || "neutral"}`,
        interactive && "is-interactive",
      )}
    >
      <div className="platform-activity-timeline__rail" aria-hidden="true">
        <span className="platform-activity-timeline__marker">
          {item.avatar || (Icon ? (
            <Icon width={14} height={14} strokeWidth={1.9} />
          ) : null)}
        </span>
      </div>
      <div
        className="platform-activity-timeline__entry"
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={interactive ? item.ariaLabel : undefined}
        onClick={item.onActivate}
        onKeyDown={interactive ? (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            item.onActivate?.();
          }
        } : undefined}
      >
        <div className="platform-activity-timeline__meta">
          <div className="platform-activity-timeline__summary">{item.summary}</div>
          {item.trailing ? (
            <div className="platform-activity-timeline__trailing">{item.trailing}</div>
          ) : null}
          {item.timestamp ? (
            <time className="platform-activity-timeline__timestamp">{item.timestamp}</time>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function PlatformActivityTimeline({
  title = "Activity",
  headerActions,
  items = [],
  composer,
  emptyTitle = "No activity yet",
  emptyDescription,
  emptyIcon,
  className = "",
}: PlatformActivityTimelineProps) {
  return (
    <section className={joinClassNames("platform-activity-timeline", className)}>
      <header className="platform-activity-timeline__header">
        <h2 className="platform-activity-timeline__title">{title}</h2>
        {headerActions ? (
          <div className="platform-activity-timeline__header-actions">{headerActions}</div>
        ) : null}
      </header>

      {items.length > 0 ? (
        <ol className="platform-activity-timeline__list">
          {items.map((item) => (
            <PlatformActivityTimelineItem key={item.id} item={item} />
          ))}
        </ol>
      ) : (
        <PlatformEmptyState
          className="platform-activity-timeline__empty"
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
        />
      )}

      {composer ? <PlatformCommentComposer {...composer} /> : null}
    </section>
  );
}

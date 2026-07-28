import { useState, type ElementType, type ReactNode } from "react";

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
  preview?: ReactNode;
  inspectorAction?: ReactNode;
}

export type PlatformActivityComposerProps = PlatformCommentComposerProps;
export type PlatformActivityTimelineLayout = "timeline" | "inspector";

export interface PlatformActivityTimelineProps {
  title?: ReactNode;
  headerActions?: ReactNode;
  items?: readonly PlatformActivityItem[];
  composer?: PlatformActivityComposerProps;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  emptyIcon?: ElementType;
  className?: string;
  layout?: PlatformActivityTimelineLayout;
  inspectorTitle?: ReactNode;
  inspectorHeaderActions?: ReactNode;
  inspectorEmptyTitle?: ReactNode;
  selectedItemId?: string;
  defaultSelectedItemId?: string;
  onSelectedItemChange?: (itemId: string) => void;
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

function PlatformActivityTimelineItem({
  item,
  selectionMode = false,
  selected = false,
  onSelect,
}: {
  item: PlatformActivityItem;
  selectionMode?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const Icon = item.icon;
  const interactive =
    selectionMode ||
    typeof item.onActivate === "function";
  const handleActivate = selectionMode ? onSelect : item.onActivate;

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
          selected && "is-selected",
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
        aria-label={
          interactive
            ? item.ariaLabel || `Inspect activity ${item.id}`
            : undefined
        }
        aria-pressed={selectionMode ? selected : undefined}
        onClick={handleActivate}
        onDoubleClick={
          selectionMode && typeof item.onActivate === "function"
            ? item.onActivate
            : undefined
        }
        onKeyDown={interactive ? (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleActivate?.();
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
  layout = "timeline",
  inspectorTitle = "Inspector",
  inspectorHeaderActions,
  inspectorEmptyTitle = "Select an activity",
  selectedItemId,
  defaultSelectedItemId = "",
  onSelectedItemChange,
}: PlatformActivityTimelineProps) {
  const [internalSelectedItemId, setInternalSelectedItemId] = useState(
    defaultSelectedItemId,
  );
  const requestedSelectedItemId =
    selectedItemId === undefined
      ? internalSelectedItemId
      : selectedItemId;
  const selectedItem =
    items.find((item) => item.id === requestedSelectedItemId) ||
    items[0] ||
    null;
  const selectedInspectorAction =
    selectedItem?.inspectorAction || inspectorHeaderActions;

  function selectItem(itemId: string) {
    if (selectedItemId === undefined) {
      setInternalSelectedItemId(itemId);
    }
    onSelectedItemChange?.(itemId);
  }

  if (layout === "inspector") {
    return (
      <section
        className={joinClassNames(
          "platform-activity-timeline",
          "is-inspector",
          className,
        )}
      >
        <div className="platform-activity-timeline__inspector-header">
          <div className="platform-activity-timeline__pane-header is-list">
            <h2 className="platform-activity-timeline__title">{title}</h2>
            {headerActions ? (
              <div className="platform-activity-timeline__header-actions">
                {headerActions}
              </div>
            ) : null}
          </div>
          <div className="platform-activity-timeline__pane-header is-preview">
            <h2 className="platform-activity-timeline__title">
              {inspectorTitle}
            </h2>
            {selectedInspectorAction ? (
              <div className="platform-activity-timeline__header-actions">
                {selectedInspectorAction}
              </div>
            ) : null}
          </div>
        </div>

        <div className="platform-activity-timeline__inspector-body">
          <div className="platform-activity-timeline__list-pane">
            {items.length > 0 ? (
              <ol className="platform-activity-timeline__list">
                {items.map((item) => (
                  <PlatformActivityTimelineItem
                    key={item.id}
                    item={item}
                    selectionMode
                    selected={selectedItem?.id === item.id}
                    onSelect={() => selectItem(item.id)}
                  />
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
          </div>

          <div
            className="platform-activity-timeline__preview-pane"
            aria-live="polite"
          >
            {selectedItem ? (
              selectedItem.preview || (
                <div className="platform-activity-timeline__default-preview">
                  <div className="platform-activity-timeline__default-preview-heading">
                    {selectedItem.avatar ? (
                      <span className="platform-activity-timeline__default-preview-avatar">
                        {selectedItem.avatar}
                      </span>
                    ) : null}
                    <div>
                      <div className="platform-activity-timeline__default-preview-summary">
                        {selectedItem.summary}
                      </div>
                      {selectedItem.timestamp ? (
                        <div className="platform-activity-timeline__default-preview-timestamp">
                          {selectedItem.timestamp}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {selectedItem.trailing ? (
                    <div className="platform-activity-timeline__default-preview-content">
                      {selectedItem.trailing}
                    </div>
                  ) : null}
                </div>
              )
            ) : (
              <PlatformEmptyState
                className="platform-activity-timeline__empty"
                icon={emptyIcon}
                title={inspectorEmptyTitle}
              />
            )}
          </div>
        </div>
      </section>
    );
  }

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

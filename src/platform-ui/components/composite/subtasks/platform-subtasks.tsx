import { ListTodo, Plus } from "lucide-react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { PlatformSecondaryButton } from "../../ui/button/index.js";
import {
  PlatformLabel,
  type PlatformLabelVariant,
} from "../../ui/label/index.js";
import {
  PlatformTicketItem,
  type PlatformTicketType,
} from "../../ui/ticket-item/index.js";
import { PlatformIconButton } from "../../ui/icon-button/index.js";
import { PlatformUiCard } from "../ui-card/index.js";

export type PlatformSubtasksAppearance = "card" | "minimal";

export interface PlatformSubtaskItem {
  id: string;
  title: ReactNode;
  metadata?: ReactNode;
  leading?: ReactNode;
  taskType?: PlatformTicketType;
  priority?: ReactNode;
  ticketNumber?: ReactNode;
  status?: ReactNode;
  statusContent?: ReactNode;
  statusVariant?: PlatformLabelVariant;
  assignee?: ReactNode;
  action?: ReactNode;
  trailing?: ReactNode;
  completed?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  onActivate?: () => void;
}

export interface PlatformSubtasksProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "title"
> {
  title?: ReactNode;
  items?: readonly PlatformSubtaskItem[];
  appearance?: PlatformSubtasksAppearance;
  addLabel?: ReactNode;
  addAriaLabel?: string;
  emptyAddLabel?: ReactNode;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  disabled?: boolean;
  onAdd?: () => void;
}

function joinClassNames(
  ...classNames: Array<string | false | null | undefined>
) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

export function PlatformSubtasks({
  title = "Subtasks",
  items = [],
  appearance = "card",
  addLabel = "Subtask",
  addAriaLabel = "Add subtask",
  emptyAddLabel = "Add Subtasks",
  emptyTitle = "No subtasks yet",
  emptyDescription = "Break this ticket into smaller pieces.",
  disabled = false,
  onAdd,
  className = "",
  ...props
}: PlatformSubtasksProps) {
  return (
    <PlatformUiCard
      {...props}
      as="section"
      className={joinClassNames(
        "platform-subtasks",
        appearance === "minimal" && "is-minimal",
        className,
      )}
      data-platform-subtasks="true"
      data-platform-subtasks-appearance={appearance}
    >
      {appearance !== "minimal" || items.length > 0 ? (
        <div className="platform-subtasks__header">
          <h2 className="platform-subtasks__title">{title}</h2>
          {onAdd && appearance === "minimal" ? (
            <PlatformIconButton
              type="button"
              size="small"
              className="platform-subtasks__add-icon"
              aria-label={addAriaLabel}
              title={addAriaLabel}
              disabled={disabled}
              onClick={onAdd}
            >
              <Plus aria-hidden="true" strokeWidth={1.8} />
            </PlatformIconButton>
          ) : onAdd ? (
            <PlatformSecondaryButton
              type="button"
              size="small"
              className="platform-subtasks__add"
              disabled={disabled}
              onClick={onAdd}
            >
              <Plus aria-hidden="true" strokeWidth={1.8} />
              {addLabel}
            </PlatformSecondaryButton>
          ) : null}
        </div>
      ) : null}

      <div className="platform-subtasks__content">
        {items.length ? (
          <div className="platform-subtasks__list" role="list">
            {items.map((item) => {
              const itemDisabled = disabled || item.disabled;
              const statusContent =
                item.statusContent ||
                (item.status ? (
                  <PlatformLabel variant={item.statusVariant || "gray"}>
                    {item.status}
                  </PlatformLabel>
                ) : null);

              return (
                <PlatformTicketItem
                  key={item.id}
                  variant="list"
                  appearance="minimalistic-ui"
                  className={joinClassNames(
                    "platform-subtasks__ticket-item",
                    item.className,
                  )}
                  style={item.style}
                  taskType={item.taskType || "subtask"}
                  typeIcon={item.leading || <ListTodo strokeWidth={1.7} />}
                  priority={item.priority}
                  ticketNumber={item.ticketNumber ?? item.metadata}
                  title={item.title}
                  completed={item.completed}
                  status={statusContent}
                  assignee={item.assignee}
                  action={item.action || item.trailing}
                  disabled={itemDisabled}
                  role={item.onActivate ? "button" : "listitem"}
                  tabIndex={item.onActivate && !itemDisabled ? 0 : undefined}
                  onClick={
                    item.onActivate && !itemDisabled
                      ? item.onActivate
                      : undefined
                  }
                  onKeyDown={
                    item.onActivate && !itemDisabled
                      ? (event) => {
                          if (event.key !== "Enter" && event.key !== " ")
                            return;
                          event.preventDefault();
                          item.onActivate?.();
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        ) : appearance === "minimal" && onAdd ? (
          <div className="platform-subtasks__empty is-action-only">
            <PlatformSecondaryButton
              type="button"
              size="small"
              className="platform-subtasks__empty-add"
              disabled={disabled}
              onClick={onAdd}
            >
              <Plus aria-hidden="true" strokeWidth={1.8} />
              {emptyAddLabel}
            </PlatformSecondaryButton>
          </div>
        ) : (
          <div className="platform-subtasks__empty">
            <ListTodo
              className="platform-subtasks__empty-icon"
              strokeWidth={1.7}
            />
            <span className="platform-subtasks__empty-title">{emptyTitle}</span>
            <span className="platform-subtasks__empty-description">
              {emptyDescription}
            </span>
          </div>
        )}
      </div>
    </PlatformUiCard>
  );
}

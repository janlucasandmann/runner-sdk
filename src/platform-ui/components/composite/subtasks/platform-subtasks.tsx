import { ListTodo, Plus } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { PlatformSecondaryButton } from "../../ui/button/index.js";
import { PlatformLabel, type PlatformLabelVariant } from "../../ui/label/index.js";
import { PlatformUiCard } from "../ui-card/index.js";

export interface PlatformSubtaskItem {
  id: string;
  title: ReactNode;
  metadata?: ReactNode;
  leading?: ReactNode;
  status?: ReactNode;
  statusVariant?: PlatformLabelVariant;
  trailing?: ReactNode;
  disabled?: boolean;
  onActivate?: () => void;
}

export interface PlatformSubtasksProps
  extends Omit<HTMLAttributes<HTMLElement>, "children" | "title"> {
  title?: ReactNode;
  items?: readonly PlatformSubtaskItem[];
  addLabel?: ReactNode;
  emptyTitle?: ReactNode;
  emptyDescription?: ReactNode;
  disabled?: boolean;
  onAdd?: () => void;
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

export function PlatformSubtasks({
  title = "Subtasks",
  items = [],
  addLabel = "Subtask",
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
      className={joinClassNames("platform-subtasks", className)}
      data-platform-subtasks="true"
    >
      <div className="platform-subtasks__header">
        <h2 className="platform-subtasks__title">{title}</h2>
        {onAdd ? (
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

      <div className="platform-subtasks__content">
        {items.length ? (
          <div className="platform-subtasks__list" role="list">
            {items.map((item) => {
              const itemContent = (
                <>
                  <span className="platform-subtasks__leading" aria-hidden="true">
                    {item.leading || <ListTodo strokeWidth={1.7} />}
                  </span>
                  <span className="platform-subtasks__copy">
                    <span className="platform-subtasks__item-title">{item.title}</span>
                    {item.metadata ? (
                      <span className="platform-subtasks__metadata">{item.metadata}</span>
                    ) : null}
                  </span>
                </>
              );

              return (
                <div
                  key={item.id}
                  className={joinClassNames(
                    "platform-subtasks__item",
                    (disabled || item.disabled) && "is-disabled",
                  )}
                  role="listitem"
                >
                  {item.onActivate ? (
                    <button
                      type="button"
                      className="platform-subtasks__item-main"
                      disabled={disabled || item.disabled}
                      onClick={item.onActivate}
                    >
                      {itemContent}
                    </button>
                  ) : (
                    <div className="platform-subtasks__item-main">{itemContent}</div>
                  )}
                  {item.trailing || item.status ? (
                    <div className="platform-subtasks__item-end">
                      {item.trailing || (
                        <PlatformLabel variant={item.statusVariant || "gray"}>
                          {item.status}
                        </PlatformLabel>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="platform-subtasks__empty">
            <ListTodo className="platform-subtasks__empty-icon" strokeWidth={1.7} />
            <span className="platform-subtasks__empty-title">{emptyTitle}</span>
            <span className="platform-subtasks__empty-description">{emptyDescription}</span>
          </div>
        )}
      </div>
    </PlatformUiCard>
  );
}

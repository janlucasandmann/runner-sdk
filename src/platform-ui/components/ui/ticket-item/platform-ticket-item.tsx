import {
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";

export type PlatformTicketItemVariant = "list" | "card";
export type PlatformTicketItemAppearance = "default" | "minimalistic-ui";
export type PlatformTicketType = "task" | "subtask" | "loop";

interface PlatformTicketItemBaseProps {
  title: ReactNode;
  taskType?: PlatformTicketType;
  typeIcon?: ReactNode;
  priority?: ReactNode;
  ticketNumber?: ReactNode;
  status?: ReactNode;
  assignee?: ReactNode;
  action?: ReactNode;
  completed?: boolean;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface PlatformTicketListItemProps
  extends
    PlatformTicketItemBaseProps,
    Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> {
  variant?: "list";
  appearance?: PlatformTicketItemAppearance;
  titleEditor?: ReactNode;
}

export interface PlatformTicketCardItemProps
  extends
    Omit<PlatformTicketItemBaseProps, "action">,
    Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      "children" | "title" | "disabled"
    > {
  variant: "card";
  description?: ReactNode;
}

export type PlatformTicketItemProps =
  PlatformTicketListItemProps | PlatformTicketCardItemProps;

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

function getTicketTypeClassName(taskType: PlatformTicketType) {
  return `is-${taskType}`;
}

function renderCardDescription(description: ReactNode) {
  const descriptionClassName =
    "platform-ticket-item__description playground-tasks-lane-card-copy";
  if (isValidElement(description)) {
    const descriptionElement = description as ReactElement<{
      className?: string;
    }>;
    return cloneElement(descriptionElement, {
      className: joinClassNames(
        descriptionClassName,
        descriptionElement.props.className,
      ),
    });
  }
  return <div className={descriptionClassName}>{description}</div>;
}

function PlatformTicketListItem({
  title,
  titleEditor,
  taskType = "task",
  typeIcon,
  priority,
  ticketNumber,
  status,
  assignee,
  action,
  completed = false,
  active = false,
  disabled = false,
  appearance = "default",
  className = "",
  ...props
}: PlatformTicketListItemProps) {
  return (
    <div
      {...props}
      className={joinClassNames(
        "platform-ticket-item is-list playground-tasks-backlog-item",
        appearance === "minimalistic-ui" && "is-minimalistic-ui",
        active && "is-active",
        disabled && "is-disabled",
        className,
      )}
      data-platform-ticket-item="true"
      data-platform-ticket-item-variant="list"
      data-platform-ticket-item-appearance={appearance}
      aria-disabled={props["aria-disabled"] ?? (disabled || undefined)}
    >
      <div className="platform-ticket-item__content playground-tasks-backlog-item-content">
        <div className="platform-ticket-item__leading playground-tasks-backlog-leading">
          {typeIcon ? (
            <div
              className={joinClassNames(
                "platform-ticket-item__type playground-tasks-backlog-project-icon",
                getTicketTypeClassName(taskType),
              )}
              aria-hidden="true"
            >
              {typeIcon}
            </div>
          ) : null}
          <div className="platform-ticket-item__main playground-tasks-backlog-main">
            {priority}
            {ticketNumber !== undefined && ticketNumber !== null ? (
              <span className="platform-ticket-item__number playground-tasks-backlog-ticket">
                {ticketNumber}
              </span>
            ) : null}
            {titleEditor || (
              <span
                className={joinClassNames(
                  "platform-ticket-item__title playground-tasks-backlog-title",
                  completed && "is-complete",
                )}
              >
                {title}
              </span>
            )}
          </div>
        </div>
        {status || assignee ? (
          <div className="platform-ticket-item__meta playground-tasks-backlog-meta">
            {status}
            {assignee ? (
              <div className="platform-ticket-item__assignee playground-tasks-backlog-assignee-shell">
                {assignee}
              </div>
            ) : null}
          </div>
        ) : null}
        {action}
      </div>
    </div>
  );
}

function PlatformTicketCardItem({
  title,
  description,
  taskType = "task",
  typeIcon,
  priority,
  ticketNumber,
  status,
  assignee,
  completed = false,
  active = false,
  disabled = false,
  className = "",
  type = "button",
  ...props
}: PlatformTicketCardItemProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      className={joinClassNames(
        "platform-ticket-item is-card playground-tasks-lane-card",
        active && "is-active",
        className,
      )}
      data-platform-ticket-item="true"
      data-platform-ticket-item-variant="card"
    >
      <div className="platform-ticket-item__card-header playground-tasks-lane-card-header">
        <div
          className={joinClassNames(
            "platform-ticket-item__card-title playground-tasks-lane-card-title",
            completed && "is-complete",
          )}
        >
          {title}
        </div>
        {assignee}
      </div>
      {description ? renderCardDescription(description) : null}
      <div className="platform-ticket-item__card-footer playground-tasks-lane-card-bottom">
        <div className="platform-ticket-item__card-meta playground-tasks-lane-card-meta-left">
          {typeIcon ? (
            <div
              className={joinClassNames(
                "platform-ticket-item__card-type playground-tasks-lane-card-type-badge",
                getTicketTypeClassName(taskType),
              )}
              aria-hidden="true"
            >
              {typeIcon}
            </div>
          ) : null}
          {priority}
          {status}
        </div>
        {ticketNumber !== undefined && ticketNumber !== null ? (
          <span className="platform-ticket-item__card-number playground-tasks-lane-card-ticket">
            {ticketNumber}
          </span>
        ) : null}
      </div>
    </button>
  );
}

export function PlatformTicketItem(props: PlatformTicketItemProps) {
  if (props.variant === "card") {
    return <PlatformTicketCardItem {...props} />;
  }
  return <PlatformTicketListItem {...props} />;
}

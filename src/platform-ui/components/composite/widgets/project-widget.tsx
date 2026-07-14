import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { ChevronDown, EllipsisVertical } from "lucide-react";
import {
  PlatformDefaultWidget,
  type PlatformDefaultWidgetProps,
  joinPlatformWidgetClassNames,
} from "./platform-widget.js";

type WidgetCSSProperties = CSSProperties & Record<`--${string}`, string | number>;

export interface PlatformProjectWidgetProps extends Omit<
  PlatformDefaultWidgetProps,
  "children" | "className"
> {
  title: string;
  wallpaperUrl: string;
  hasProject?: boolean;
  openTaskCount?: number;
  totalTaskCount?: number;
  onSwitchProject?: (event: MouseEvent<HTMLButtonElement>) => void;
  onEditProject?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  children?: ReactNode;
}

export function PlatformProjectWidget({
  title,
  wallpaperUrl,
  hasProject = false,
  openTaskCount = 0,
  totalTaskCount = 0,
  onSwitchProject,
  onEditProject,
  className = "",
  children,
  ...props
}: PlatformProjectWidgetProps) {
  const normalizedTotalTaskCount = Math.max(0, Number(totalTaskCount || 0));
  const normalizedOpenTaskCount = normalizedTotalTaskCount > 0
    ? Math.min(normalizedTotalTaskCount, Math.max(0, Number(openTaskCount || 0)))
    : 0;
  const handledTaskCount = Math.max(0, normalizedTotalTaskCount - normalizedOpenTaskCount);
  const progress = normalizedTotalTaskCount > 0
    ? Math.max(0, Math.min(100, (handledTaskCount / normalizedTotalTaskCount) * 100))
    : 0;
  const progressLabel = `${Math.round(progress * 10) / 10}%`;
  const mediaStyle: CSSProperties = {
    backgroundImage: `linear-gradient(180deg, rgba(9, 10, 12, 0.06), rgba(9, 10, 12, 0.32)), url("${wallpaperUrl}")`,
  };
  const surfaceStyle: WidgetCSSProperties = {
    "--playground-project-widget-bg-image": `url("${wallpaperUrl}")`,
  };
  const progressStyle: WidgetCSSProperties = {
    "--playground-project-task-progress": progressLabel,
  };

  function handleHeaderAction(
    event: MouseEvent<HTMLButtonElement>,
    handler?: (event: MouseEvent<HTMLButtonElement>) => void
  ) {
    event.preventDefault();
    event.stopPropagation();
    handler?.(event);
  }

  return (
    <PlatformDefaultWidget
      {...props}
      className={joinPlatformWidgetClassNames(
        "playground-thread-widget-tasks playground-thread-home-project-widget",
        className
      )}
    >
      <div className="playground-thread-widget-tasks-media" style={mediaStyle}>
        <div className="playground-thread-widget-tasks-project-header">
          <span className="playground-thread-widget-tasks-project-name">{title}</span>
          {hasProject && onSwitchProject ? (
            <button
              type="button"
              className="playground-thread-widget-tasks-project-switch"
              aria-label="Switch project"
              onClick={(event) => handleHeaderAction(event, onSwitchProject)}
            >
              <ChevronDown strokeWidth={1.9} />
            </button>
          ) : null}
          {hasProject && onEditProject ? (
            <button
              type="button"
              className="playground-thread-widget-tasks-project-switch playground-thread-widget-tasks-project-menu"
              aria-label="Edit project"
              onClick={(event) => handleHeaderAction(event, onEditProject)}
            >
              <EllipsisVertical strokeWidth={1.9} />
            </button>
          ) : null}
        </div>
      </div>
      <div className="playground-thread-widget-tasks-surface" style={surfaceStyle}>
        {hasProject && normalizedOpenTaskCount > 0 ? (
          <div className="playground-thread-widget-tasks-progress" style={progressStyle}>
            <div
              className="playground-thread-widget-tasks-progress-count"
              title={`${normalizedOpenTaskCount} open tasks out of ${normalizedTotalTaskCount} total tasks`}
            >
              <span>{normalizedOpenTaskCount}</span>
              <span className="playground-thread-widget-tasks-progress-total">
                / {normalizedTotalTaskCount}
              </span>
            </div>
            <span className="playground-thread-widget-tasks-progress-label">Open Tasks</span>
            <div className="playground-thread-widget-tasks-progress-line" aria-hidden="true">
              <span className="playground-thread-widget-tasks-progress-fill" />
              <span className="playground-thread-widget-tasks-progress-marker" />
            </div>
          </div>
        ) : null}
        {children}
      </div>
    </PlatformDefaultWidget>
  );
}

export interface PlatformProjectWidgetEmptyProps {
  className?: string;
  children?: ReactNode;
}

export function PlatformProjectWidgetEmpty({
  className = "",
  children,
}: PlatformProjectWidgetEmptyProps) {
  return (
    <div className={joinPlatformWidgetClassNames(
      "playground-thread-home-project-widget-empty",
      className
    )}>
      {children}
    </div>
  );
}

export interface PlatformProjectWidgetEmptyStateProps {
  kind: "projects" | "backlog";
  title: ReactNode;
  description: ReactNode;
  action?: ReactNode;
}

export function PlatformProjectWidgetEmptyState({
  kind,
  title,
  description,
  action,
}: PlatformProjectWidgetEmptyStateProps) {
  return (
    <PlatformProjectWidgetEmpty className={`is-${kind}-empty`}>
      <div className="playground-thread-home-project-widget-empty-title">{title}</div>
      <div className="playground-thread-home-project-widget-empty-copy">{description}</div>
      {action ? <div className="playground-tasks-empty-actions">{action}</div> : null}
    </PlatformProjectWidgetEmpty>
  );
}

export interface PlatformProjectWidgetTaskListProps {
  children?: ReactNode;
}

export function PlatformProjectWidgetTaskList({ children }: PlatformProjectWidgetTaskListProps) {
  return <div className="playground-thread-widget-tasks-list">{children}</div>;
}

export interface PlatformProjectWidgetTaskProps {
  title: string;
  ticketNumber?: string;
  complete?: boolean;
  priority?: ReactNode;
  onOpen?: (event: MouseEvent<HTMLButtonElement>) => void;
}

export function PlatformProjectWidgetTask({
  title,
  ticketNumber = "",
  complete = false,
  priority,
  onOpen,
}: PlatformProjectWidgetTaskProps) {
  const normalizedTitle = title || "Untitled Task";
  const buttonTitle = ticketNumber
    ? `${ticketNumber} ${normalizedTitle}`
    : normalizedTitle;

  return (
    <div className="playground-thread-widget-tasks-item">
      <button
        type="button"
        className="playground-thread-widget-tasks-item-main"
        title={buttonTitle}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onOpen?.(event);
        }}
      >
        {priority}
        <span className={joinPlatformWidgetClassNames(
          "playground-thread-widget-tasks-item-label",
          complete && "is-complete"
        )}>
          {normalizedTitle}
        </span>
      </button>
    </div>
  );
}

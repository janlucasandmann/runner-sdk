import { Check, CircleAlert, X } from "../../ui/hugeicons-compat.js";
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export type PlatformActivityOverviewPermissionRingId = "ring_1" | "ring_2" | "ring_3" | string;

export type PlatformActivityOverviewCardStatus = "default" | "running" | "success" | "error";

export interface PlatformActivityOverviewCardProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "title"> {
  title: ReactNode;
  permissionIcon?: ReactNode;
  leadingIcon?: ReactNode;
  permissionRingId?: PlatformActivityOverviewPermissionRingId;
  actorAvatar?: ReactNode;
  actorLabel?: string;
  metadata?: ReactNode;
  status?: PlatformActivityOverviewCardStatus;
  groupLabel?: string;
  groupRailColor?: string;
  selected?: boolean;
  variant?: "default" | "plain";
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

export function PlatformActivityOverviewCard({
  title,
  permissionIcon,
  leadingIcon,
  permissionRingId = "ring_2",
  actorAvatar,
  actorLabel,
  metadata,
  status,
  groupLabel,
  groupRailColor,
  selected = false,
  variant = "default",
  className = "",
  style,
  type = "button",
  ...props
}: PlatformActivityOverviewCardProps) {
  const titleText =
    typeof title === "string" || typeof title === "number" ? String(title) : undefined;
  const normalizedRingId = String(permissionRingId || "ring_2")
    .trim()
    .toLowerCase()
    .replaceAll("_", "-");
  const StatusIcon =
    status === "error" ? X : status === "running" ? CircleAlert : status ? Check : null;

  return (
    <button
      {...props}
      type={type}
      className={joinClassNames(
        "platform-activity-overview-card",
        `is-${normalizedRingId || "ring-2"}`,
        Boolean(groupRailColor) && "has-group-rail",
        variant === "plain" && "is-plain",
        selected && "is-selected",
        className,
      )}
      style={
        {
          ...style,
          ...(groupRailColor
            ? {
                "--platform-activity-overview-group-rail-color": groupRailColor,
              }
            : {}),
        } as CSSProperties
      }
      aria-pressed={selected}
    >
      {groupRailColor ? (
        <span
          className="platform-activity-overview-card__group-rail"
          title={groupLabel}
          aria-hidden="true"
        />
      ) : null}
      <span className="platform-activity-overview-card__permission" aria-hidden="true">
        {leadingIcon || permissionIcon}
      </span>
      <span className="platform-activity-overview-card__title" title={titleText}>
        {title}
      </span>
      {metadata !== undefined && metadata !== null ? (
        <span className="platform-activity-overview-card__metadata">{metadata}</span>
      ) : null}
      {StatusIcon ? (
        <StatusIcon
          className="platform-activity-overview-card__status"
          width={14}
          height={14}
          strokeWidth={2}
          aria-hidden="true"
        />
      ) : null}
      {actorAvatar ? (
        <span
          className="platform-activity-overview-card__actor"
          title={actorLabel}
          aria-hidden="true"
        >
          {actorAvatar}
        </span>
      ) : null}
    </button>
  );
}

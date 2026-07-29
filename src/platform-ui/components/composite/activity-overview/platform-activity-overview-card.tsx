import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

export type PlatformActivityOverviewPermissionRingId =
  | "ring_1"
  | "ring_2"
  | "ring_3"
  | string;

export interface PlatformActivityOverviewCardProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "title"> {
  title: ReactNode;
  permissionIcon: ReactNode;
  permissionRingId?: PlatformActivityOverviewPermissionRingId;
  actorAvatar: ReactNode;
  actorLabel?: string;
  selected?: boolean;
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

export function PlatformActivityOverviewCard({
  title,
  permissionIcon,
  permissionRingId = "ring_2",
  actorAvatar,
  actorLabel,
  selected = false,
  className = "",
  type = "button",
  ...props
}: PlatformActivityOverviewCardProps) {
  const normalizedRingId = String(permissionRingId || "ring_2")
    .trim()
    .toLowerCase()
    .replaceAll("_", "-");

  return (
    <button
      {...props}
      type={type}
      className={joinClassNames(
        "platform-activity-overview-card",
        `is-${normalizedRingId || "ring-2"}`,
        selected && "is-selected",
        className,
      )}
      aria-pressed={selected}
    >
      <span
        className="platform-activity-overview-card__permission"
        aria-hidden="true"
      >
        {permissionIcon}
      </span>
      <span className="platform-activity-overview-card__title">
        {title}
      </span>
      <span
        className="platform-activity-overview-card__actor"
        title={actorLabel}
        aria-hidden="true"
      >
        {actorAvatar}
      </span>
    </button>
  );
}

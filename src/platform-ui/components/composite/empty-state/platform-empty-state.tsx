import type { ElementType, ReactNode } from "react";

export interface PlatformEmptyStateProps {
  icon?: ElementType;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  iconSize?: number;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

export function PlatformEmptyState({
  icon: Icon,
  title,
  description,
  className = "",
  iconSize = 20,
}: PlatformEmptyStateProps) {
  return (
    <div className={joinClassNames("platform-empty-state", className)}>
      {Icon ? (
        <Icon
          className="platform-empty-state__icon"
          width={iconSize}
          height={iconSize}
          strokeWidth={1.7}
          aria-hidden="true"
        />
      ) : null}
      <div className="platform-empty-state__title">{title}</div>
      {description ? <div className="platform-empty-state__description">{description}</div> : null}
    </div>
  );
}

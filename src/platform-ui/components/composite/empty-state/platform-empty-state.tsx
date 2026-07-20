import type { ElementType, ReactNode } from "react";
import { PlatformPrimaryButton } from "../../ui/button/index.js";

export interface PlatformEmptyStatePrimaryAction {
  label: ReactNode;
  onClick: () => void;
  icon?: ElementType;
  disabled?: boolean;
  ariaLabel?: string;
}

export interface PlatformEmptyStateProps {
  icon?: ElementType;
  title: ReactNode;
  description?: ReactNode;
  primaryAction?: PlatformEmptyStatePrimaryAction;
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
  primaryAction,
  className = "",
  iconSize = 20,
}: PlatformEmptyStateProps) {
  const PrimaryActionIcon = primaryAction?.icon;

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
      {primaryAction ? (
        <PlatformPrimaryButton
          size="small"
          className="platform-empty-state__primary-action"
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
          aria-label={primaryAction.ariaLabel}
        >
          {PrimaryActionIcon ? (
            <PrimaryActionIcon
              width={14}
              height={14}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          ) : null}
          <span>{primaryAction.label}</span>
        </PlatformPrimaryButton>
      ) : null}
    </div>
  );
}

import type { LucideIcon } from "../../ui/hugeicons-compat.js";
import { createElement, type ReactNode } from "react";

export interface PlatformPageHeroAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  ariaLabel?: string;
  onClick: () => void;
}

export interface PlatformPageHeroProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: readonly PlatformPageHeroAction[];
  actionsContent?: ReactNode;
  className?: string;
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

function PlatformPageHeroActionButton({
  action,
}: {
  action: PlatformPageHeroAction;
}) {
  return (
    <button
      type="button"
      className="platform-page-hero__action"
      aria-label={action.ariaLabel || action.label}
      onClick={action.onClick}
    >
      {action.icon
        ? createElement(action.icon, {
            width: 15,
            height: 15,
            strokeWidth: 1.7,
            "aria-hidden": true,
          })
        : null}
      <span>{action.label}</span>
    </button>
  );
}

export function PlatformPageHero({
  title,
  description,
  actions = [],
  actionsContent,
  className = "",
}: PlatformPageHeroProps) {
  const hasDescription = description !== undefined && description !== null;
  const hasActions = actionsContent != null || actions.length > 0;

  return (
    <header
      className={joinClassNames("platform-page-hero", className)}
      data-platform-page-hero="true"
    >
      <div className="platform-page-hero__copy">
        <h1 className="platform-page-hero__title">{title}</h1>
        {hasDescription ? (
          <p className="platform-page-hero__description">{description}</p>
        ) : null}
      </div>
      {hasActions ? (
        <div className="platform-page-hero__actions">
          {actionsContent ??
            actions.map((action) => (
              <PlatformPageHeroActionButton key={action.id} action={action} />
            ))}
        </div>
      ) : null}
    </header>
  );
}

import type { LucideIcon } from "lucide-react";
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
  className?: string;
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
  className = "",
}: PlatformPageHeroProps) {
  const hasDescription = description !== undefined && description !== null;

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
      {actions.length > 0 ? (
        <div className="platform-page-hero__actions">
          {actions.map((action) => (
            <PlatformPageHeroActionButton key={action.id} action={action} />
          ))}
        </div>
      ) : null}
    </header>
  );
}

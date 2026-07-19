import { createElement, type HTMLAttributes, type ReactNode } from "react";

export type PlatformUiCardElement = "article" | "div" | "section";
export type PlatformUiCardVariant = "default" | "feature" | "sidebar";

export interface PlatformUiCardProps extends HTMLAttributes<HTMLElement> {
  as?: PlatformUiCardElement;
  variant?: PlatformUiCardVariant;
  cardTitle?: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
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

export function PlatformUiCard({
  as = "div",
  variant = "default",
  cardTitle,
  headerActions,
  children,
  className = "",
  ...props
}: PlatformUiCardProps) {
  const content =
    variant === "sidebar" && (cardTitle || headerActions) ? (
      <>
        <div className="platform-ui-card__sidebar-header">
          {cardTitle ? <h2 className="platform-ui-card__sidebar-title">{cardTitle}</h2> : null}
          {headerActions ? (
            <div className="platform-ui-card__sidebar-actions">{headerActions}</div>
          ) : null}
        </div>
        {children}
      </>
    ) : (
      children
    );

  return createElement(
    as,
    {
      ...props,
      className: joinClassNames(
        "platform-ui-card",
        variant === "feature" && "is-feature",
        variant === "sidebar" && "is-sidebar",
        className,
      ),
      "data-platform-ui-card-variant": variant,
    },
    content,
  );
}

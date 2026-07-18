import { createElement, type HTMLAttributes, type ReactNode } from "react";

export type PlatformUiCardElement = "article" | "div" | "section";
export type PlatformUiCardVariant = "default" | "feature";

export interface PlatformUiCardProps extends HTMLAttributes<HTMLElement> {
  as?: PlatformUiCardElement;
  variant?: PlatformUiCardVariant;
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
  children,
  className = "",
  ...props
}: PlatformUiCardProps) {
  return createElement(
    as,
    {
      ...props,
      className: joinClassNames(
        "platform-ui-card",
        variant === "feature" && "is-feature",
        className,
      ),
      "data-platform-ui-card-variant": variant,
    },
    children,
  );
}

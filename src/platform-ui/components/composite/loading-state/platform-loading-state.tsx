import type { ReactNode } from "react";

export interface PlatformLoadingStateProps {
  message: ReactNode;
  className?: string;
  centered?: boolean;
  as?: "div" | "span";
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

export function PlatformLoadingState({
  message,
  className = "",
  centered = false,
  as: Component = "div",
}: PlatformLoadingStateProps) {
  const accessibleMessage = typeof message === "string" ? message : "Loading";

  return (
    <Component
      className={joinClassNames("platform-loading-state", centered && "is-centered", className)}
      role="status"
      aria-live="polite"
      aria-label={accessibleMessage}
    >
      <span className="platform-loading-state__loader" aria-hidden="true">
        <img
          className="platform-loading-state__spinner"
          src="/img/spinner.svg"
          alt=""
          width={24}
          height={24}
        />
      </span>
    </Component>
  );
}

import type { ReactNode } from "react";
import { DotLoader } from "../../ui/dot-loader/index.js";

export interface PlatformLoadingStateProps {
  message: ReactNode;
  className?: string;
  centered?: boolean;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

export function PlatformLoadingState({
  message,
  className = "",
  centered = false,
}: PlatformLoadingStateProps) {
  const accessibleMessage = typeof message === "string" ? message : "Loading";

  return (
    <div
      className={joinClassNames(
        "platform-loading-state",
        centered && "is-centered",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={accessibleMessage}
    >
      <span className="platform-loading-state__loader" aria-hidden="true">
        <DotLoader dotCount={9} dotSize={3} gap={2} speed={800} />
      </span>
      <span className="platform-loading-state__message">{message}</span>
    </div>
  );
}

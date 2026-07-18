import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export type PlatformIconButtonSize = "compact" | "small" | "medium";

export interface PlatformIconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> {
  "aria-label": string;
  children: ReactNode;
  size?: PlatformIconButtonSize;
  active?: boolean;
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

export const PlatformIconButton = forwardRef<HTMLButtonElement, PlatformIconButtonProps>(
  function PlatformIconButton(
    { size = "small", active = false, type = "button", className = "", children, ...props },
    ref,
  ) {
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        className={joinClassNames(
          "platform-icon-button",
          `is-size-${size}`,
          active && "is-active",
          className,
        )}
        data-platform-icon-button-size={size}
        aria-pressed={props["aria-pressed"] ?? (active ? true : undefined)}
      >
        {children}
      </button>
    );
  },
);

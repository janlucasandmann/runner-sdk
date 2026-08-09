import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";

export type PlatformIconButtonSize = "compact" | "small" | "medium";
export type PlatformIconButtonTooltipPlacement = "top" | "right" | "bottom" | "left";
export type PlatformIconButtonTooltipAlign = "start" | "center" | "end";

export interface PlatformIconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> {
  "aria-label": string;
  children: ReactNode;
  size?: PlatformIconButtonSize;
  active?: boolean;
  tooltip?: string;
  tooltipShortcut?: string;
  tooltipPlacement?: PlatformIconButtonTooltipPlacement;
  tooltipAlign?: PlatformIconButtonTooltipAlign;
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
    {
      size = "small",
      active = false,
      tooltip,
      tooltipShortcut,
      tooltipPlacement = "bottom",
      tooltipAlign = "center",
      type = "button",
      className = "",
      children,
      ...props
    },
    ref,
  ) {
    const normalizedTooltip = typeof tooltip === "string" ? tooltip.trim() : "";
    const normalizedTooltipShortcut =
      normalizedTooltip && typeof tooltipShortcut === "string" ? tooltipShortcut.trim() : "";
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
        data-platform-icon-button-tooltip={normalizedTooltip || undefined}
        data-platform-icon-button-tooltip-shortcut={normalizedTooltipShortcut || undefined}
        data-platform-icon-button-tooltip-placement={
          normalizedTooltip ? tooltipPlacement : undefined
        }
        data-platform-icon-button-tooltip-align={normalizedTooltip ? tooltipAlign : undefined}
        aria-pressed={props["aria-pressed"] ?? (active ? true : undefined)}
      >
        {children}
        {normalizedTooltip ? (
          <span className="platform-icon-button__tooltip" aria-hidden="true">
            <span className="platform-icon-button__tooltip-label">{normalizedTooltip}</span>
            {normalizedTooltipShortcut ? (
              <span className="platform-icon-button__tooltip-shortcut">
                {normalizedTooltipShortcut}
              </span>
            ) : null}
          </span>
        ) : null}
      </button>
    );
  },
);

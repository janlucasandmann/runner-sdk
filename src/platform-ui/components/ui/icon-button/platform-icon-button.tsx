import {
  type ButtonHTMLAttributes,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

export type PlatformIconButtonSize = "compact" | "small" | "medium";
export type PlatformIconButtonTooltipPlacement = "top" | "right" | "bottom" | "left";
export type PlatformIconButtonTooltipAlign = "start" | "center" | "end";

export interface PlatformHoverLabelProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  children: ReactNode;
  label: string;
  shortcut?: string;
  placement?: PlatformIconButtonTooltipPlacement;
  align?: PlatformIconButtonTooltipAlign;
}

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

function PlatformHoverLabelContent({
  label,
  shortcut,
  className,
}: {
  label: string;
  shortcut?: string;
  className?: string;
}) {
  const normalizedLabel = label.trim();
  const normalizedShortcut = typeof shortcut === "string" ? shortcut.trim() : "";
  if (!normalizedLabel) {
    return null;
  }

  return (
    <span className={joinClassNames("platform-icon-button__tooltip", className)} aria-hidden="true">
      <span className="platform-icon-button__tooltip-label">{normalizedLabel}</span>
      {normalizedShortcut ? (
        <span className="platform-icon-button__tooltip-shortcut">{normalizedShortcut}</span>
      ) : null}
    </span>
  );
}

/**
 * Shared hover label used by icon controls and larger composer selectors.
 * Keeping the label surface in one primitive makes hover affordances consistent
 * across the shell and chat composer without nesting interactive elements.
 */
export function PlatformHoverLabel({
  align = "center",
  children,
  className = "",
  label,
  placement = "bottom",
  shortcut,
  ...props
}: PlatformHoverLabelProps) {
  const normalizedLabel = label.trim();
  const normalizedShortcut = typeof shortcut === "string" ? shortcut.trim() : "";

  return (
    <span
      {...props}
      className={joinClassNames("platform-hover-label", className)}
      data-platform-hover-label={normalizedLabel || undefined}
      data-platform-hover-label-shortcut={normalizedShortcut || undefined}
      data-platform-hover-label-placement={normalizedLabel ? placement : undefined}
      data-platform-hover-label-align={normalizedLabel ? align : undefined}
    >
      {children}
      <PlatformHoverLabelContent
        label={normalizedLabel}
        shortcut={normalizedShortcut}
      />
    </span>
  );
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
        <PlatformHoverLabelContent
          label={normalizedTooltip}
          shortcut={normalizedTooltipShortcut}
        />
      </button>
    );
  },
);

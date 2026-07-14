import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

export type PlatformWidgetActivationEvent =
  | MouseEvent<HTMLDivElement>
  | KeyboardEvent<HTMLDivElement>;

export interface PlatformDefaultWidgetProps extends HTMLAttributes<HTMLDivElement> {
  onActivate?: (event: PlatformWidgetActivationEvent) => void;
  clickable?: boolean;
}

export function joinPlatformWidgetClassNames(
  ...classNames: Array<string | false | null | undefined>
) {
  return classNames
    .filter((className): className is string => (
      typeof className === "string" && Boolean(className.trim())
    ))
    .map((className) => className.trim())
    .join(" ");
}

export const PlatformDefaultWidget = forwardRef<HTMLDivElement, PlatformDefaultWidgetProps>(
  function PlatformDefaultWidget({
    onActivate,
    clickable = Boolean(onActivate),
    className = "",
    role,
    tabIndex,
    onClick,
    onKeyDown,
    ...props
  }, ref) {
    const isInteractive = typeof onActivate === "function";

    return (
      <div
        {...props}
        ref={ref}
        className={joinPlatformWidgetClassNames(
          "playground-thread-widget",
          className,
          clickable && "is-clickable"
        )}
        role={role ?? (isInteractive ? "button" : undefined)}
        tabIndex={tabIndex ?? (isInteractive ? 0 : undefined)}
        onClick={onClick || onActivate ? (event) => {
          onClick?.(event);
          if (!event.defaultPrevented) onActivate?.(event);
        } : undefined}
        onKeyDown={onKeyDown || onActivate ? (event) => {
          onKeyDown?.(event);
          if (
            !event.defaultPrevented
            && isInteractive
            && (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            onActivate(event);
          }
        } : undefined}
      />
    );
  }
);

export const PlatformWidget = PlatformDefaultWidget;

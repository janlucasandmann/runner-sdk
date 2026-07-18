import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

export type PlatformLabelVariant = "gray" | "green" | "blue" | "yellow" | "red";
export type PlatformPriorityBarsCount = 0 | 1 | 2 | 3;

export interface PlatformLabelProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: PlatformLabelVariant;
  icon?: ReactNode;
}

export interface PlatformPriorityBarsIconProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  activeBars?: PlatformPriorityBarsCount;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

export function PlatformPriorityBarsIcon({
  activeBars = 0,
  className = "",
  ...props
}: PlatformPriorityBarsIconProps) {
  return (
    <span
      {...props}
      className={joinClassNames(
        "platform-priority-bars-icon",
        "playground-tasks-priority-value-icon",
        "playground-tasks-priority-bars-icon",
        className,
      )}
      data-platform-priority-active-bars={activeBars}
      aria-hidden="true"
    >
      {([1, 2, 3] as const).map((bar) => (
        <span
          key={bar}
          className={joinClassNames(
            "platform-priority-bars-icon__bar",
            "playground-tasks-priority-bars-bar",
            bar <= activeBars && "is-active",
          )}
        />
      ))}
    </span>
  );
}

export const PlatformLabel = forwardRef<HTMLSpanElement, PlatformLabelProps>(
  function PlatformLabel({
    variant = "gray",
    icon,
    className = "",
    children,
    ...props
  }, ref) {
    return (
      <span
        {...props}
        ref={ref}
        className={joinClassNames("platform-label", `is-${variant}`, Boolean(icon) && "has-icon", className)}
        data-platform-label-variant={variant}
        data-platform-label-has-icon={icon ? "true" : undefined}
      >
        {icon ? <span className="platform-label__icon" aria-hidden="true">{icon}</span> : null}
        {children}
      </span>
    );
  },
);

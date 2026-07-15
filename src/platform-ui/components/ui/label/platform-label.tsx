import {
  forwardRef,
  type HTMLAttributes,
} from "react";

export type PlatformLabelVariant = "gray" | "green" | "blue" | "yellow";

export interface PlatformLabelProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: PlatformLabelVariant;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

export const PlatformLabel = forwardRef<HTMLSpanElement, PlatformLabelProps>(
  function PlatformLabel({
    variant = "gray",
    className = "",
    children,
    ...props
  }, ref) {
    return (
      <span
        {...props}
        ref={ref}
        className={joinClassNames("platform-label", `is-${variant}`, className)}
        data-platform-label-variant={variant}
      >
        {children}
      </span>
    );
  },
);

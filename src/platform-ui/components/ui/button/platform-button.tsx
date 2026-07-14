import {
  forwardRef,
  type ButtonHTMLAttributes,
  type CSSProperties,
} from "react";

export type PlatformButtonVariant = "primary" | "secondary";
export type PlatformButtonSize = "compact" | "small" | "medium" | "large";

export interface PlatformButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PlatformButtonVariant;
  size?: PlatformButtonSize;
  fullWidth?: boolean;
  active?: boolean;
  width?: CSSProperties["width"];
  minWidth?: CSSProperties["minWidth"];
}

export type PlatformButtonVariantProps = Omit<PlatformButtonProps, "variant">;

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

export const PlatformButton = forwardRef<HTMLButtonElement, PlatformButtonProps>(
  function PlatformButton({
    variant = "secondary",
    size = "small",
    fullWidth = false,
    active = false,
    width,
    minWidth,
    type = "button",
    className = "",
    children,
    style,
    ...props
  }, ref) {
    return (
      <button
        {...props}
        ref={ref}
        type={type}
        className={joinClassNames(
          "platform-button",
          `is-${variant}`,
          `is-size-${size}`,
          fullWidth && "is-full-width",
          active && "is-active",
          className
        )}
        data-platform-button-variant={variant}
        data-platform-button-size={size}
        aria-pressed={props["aria-pressed"] ?? (active ? true : undefined)}
        style={{
          ...style,
          width: width ?? style?.width,
          minWidth: minWidth ?? style?.minWidth,
        }}
      >
        {children}
      </button>
    );
  }
);

export const PlatformPrimaryButton = forwardRef<HTMLButtonElement, PlatformButtonVariantProps>(
  function PlatformPrimaryButton(props, ref) {
    return <PlatformButton {...props} ref={ref} variant="primary" />;
  }
);

export const PlatformSecondaryButton = forwardRef<HTMLButtonElement, PlatformButtonVariantProps>(
  function PlatformSecondaryButton(props, ref) {
    return <PlatformButton {...props} ref={ref} variant="secondary" />;
  }
);

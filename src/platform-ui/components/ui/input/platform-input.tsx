import { forwardRef, type InputHTMLAttributes } from "react";

export type PlatformInputSize = "small" | "medium" | "large";

export interface PlatformInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: PlatformInputSize;
  fullWidth?: boolean;
  invalid?: boolean;
}

function joinPlatformInputClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

export const PlatformInput = forwardRef<HTMLInputElement, PlatformInputProps>(
  function PlatformInput(
    {
      size = "medium",
      fullWidth = false,
      invalid = false,
      className = "",
      type = "text",
      "aria-invalid": ariaInvalid,
      ...props
    },
    ref,
  ) {
    return (
      <input
        {...props}
        ref={ref}
        type={type}
        aria-invalid={ariaInvalid ?? (invalid || undefined)}
        className={joinPlatformInputClassNames(
          "platform-input",
          `is-size-${size}`,
          fullWidth && "is-full-width",
          invalid && "is-invalid",
          className,
        )}
        data-platform-input="true"
      />
    );
  },
);

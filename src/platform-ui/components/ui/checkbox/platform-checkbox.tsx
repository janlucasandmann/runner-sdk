import {
  forwardRef,
  type ButtonHTMLAttributes,
} from "react";

export interface PlatformCheckboxProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "aria-checked" | "children"
  > {
  "aria-label": string;
  checked?: boolean;
  indeterminate?: boolean;
}

function joinClassNames(
  ...classNames: Array<string | false | null | undefined>
) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

export const PlatformCheckbox = forwardRef<
  HTMLButtonElement,
  PlatformCheckboxProps
>(function PlatformCheckbox(
  {
    checked = false,
    indeterminate = false,
    type = "button",
    className = "",
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type}
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      className={joinClassNames(
        "platform-checkbox",
        checked && "is-selected",
        indeterminate && "is-partial",
        className,
      )}
      data-platform-checkbox="true"
    />
  );
});

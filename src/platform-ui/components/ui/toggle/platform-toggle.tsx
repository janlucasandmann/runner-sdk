import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
} from "react";

export interface PlatformToggleProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "aria-checked" | "children" | "onChange"
  > {
  "aria-label": string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function joinPlatformToggleClassNames(
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

export const PlatformToggle = forwardRef<
  HTMLButtonElement,
  PlatformToggleProps
>(function PlatformToggle(
  {
    checked = false,
    className = "",
    disabled = false,
    onCheckedChange,
    onClick,
    type = "button",
    ...props
  },
  ref,
) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (!event.defaultPrevented && !disabled) {
      onCheckedChange?.(!checked);
    }
  }

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={joinPlatformToggleClassNames(
        "platform-toggle",
        checked && "is-checked",
        className,
      )}
      data-platform-toggle="true"
      onClick={handleClick}
    >
      <span className="platform-toggle__thumb" aria-hidden="true" />
    </button>
  );
});

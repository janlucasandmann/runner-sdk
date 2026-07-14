import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";
import { Search } from "lucide-react";

export interface PlatformSearchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type"> {
  className?: string;
  inputClassName?: string;
}

function joinPlatformSearchClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

export const PlatformSearch = forwardRef<HTMLInputElement, PlatformSearchProps>(
  function PlatformSearch({
    className = "",
    inputClassName = "",
    placeholder = "Search",
    disabled = false,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...props
  }, ref) {
    const resolvedAriaLabel = ariaLabel
      || (ariaLabelledBy ? undefined : placeholder || "Search");

    return (
      <label
        className={joinPlatformSearchClassNames(
          "platform-search",
          disabled && "is-disabled",
          className,
        )}
        data-platform-search="true"
      >
        <Search
          className="platform-search__icon"
          width={14}
          height={14}
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <input
          {...props}
          ref={ref}
          type="search"
          className={joinPlatformSearchClassNames("platform-search__input", inputClassName)}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={resolvedAriaLabel}
          aria-labelledby={ariaLabelledBy}
        />
      </label>
    );
  },
);

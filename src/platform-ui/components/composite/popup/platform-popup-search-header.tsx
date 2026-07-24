import {
  forwardRef,
  useEffect,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { Search } from "lucide-react";
import { joinPlatformPopupClassNames } from "./platform-popup.js";

export interface PlatformPopupSearchHeaderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  shortcut?: ReactNode;
  showSearchIcon?: boolean;
  containerClassName?: string;
}

function assignPlatformPopupSearchHeaderRef(
  ref: Ref<HTMLInputElement> | undefined,
  value: HTMLInputElement | null,
) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

export const PlatformPopupSearchHeader = forwardRef<
  HTMLInputElement,
  PlatformPopupSearchHeaderProps
>(function PlatformPopupSearchHeader({
  shortcut = null,
  showSearchIcon = false,
  containerClassName = "",
  className = "",
  autoFocus = false,
  ...inputProps
}, forwardedRef) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!autoFocus) return;
    inputRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  return (
    <div
      className={joinPlatformPopupClassNames(
        "platform-popup-search-header",
        showSearchIcon && "has-search-icon",
        containerClassName,
      )}
    >
      {showSearchIcon ? (
        <Search
          className="platform-popup-search-header__icon"
          width={14}
          height={14}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      ) : null}
      <input
        {...inputProps}
        ref={(element) => {
          inputRef.current = element;
          assignPlatformPopupSearchHeaderRef(forwardedRef, element);
        }}
        type="search"
        autoFocus={autoFocus}
        className={joinPlatformPopupClassNames(
          "platform-popup-search-header__input",
          className,
        )}
      />
      {shortcut ? (
        <kbd className="platform-popup-search-header__shortcut" aria-hidden="true">
          {shortcut}
        </kbd>
      ) : null}
    </div>
  );
});

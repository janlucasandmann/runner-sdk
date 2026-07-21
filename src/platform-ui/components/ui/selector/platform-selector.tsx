import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { PlatformPopup } from "../../composite/popup/platform-popup.js";

export type PlatformSelectorAlignment = "start" | "end";
export type PlatformSelectorPopupAlignment = "left" | "right";

export interface PlatformSelectorOption<TValue extends string = string> {
  value: TValue;
  label: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
  title?: string;
}

export interface PlatformSelectorProps<TValue extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "defaultValue" | "onChange"> {
  value: TValue;
  options: readonly PlatformSelectorOption<TValue>[];
  onValueChange?: (value: TValue, option: PlatformSelectorOption<TValue>) => void;
  ariaLabel: string;
  label?: ReactNode;
  placeholder?: ReactNode;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  alignment?: PlatformSelectorAlignment;
  popupAlignment?: PlatformSelectorPopupAlignment;
  fullWidth?: boolean;
  loading?: boolean;
  loadingContent?: ReactNode;
  emptyContent?: ReactNode;
  popupHeader?: ReactNode;
  popupHeaderClassName?: string;
  popupContent?: ReactNode;
  popupContentClassName?: string;
  popupAriaLabel?: string;
  popupWidth?: CSSProperties["width"];
  popupMaxWidth?: CSSProperties["maxWidth"];
  popupMaxHeight?: CSSProperties["maxHeight"];
  triggerClassName?: string;
  popupClassName?: string;
  optionClassName?: string;
}

function joinPlatformSelectorClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

function assignPlatformSelectorRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

export const PlatformSelector = forwardRef(function PlatformSelector<
  TValue extends string = string,
>({
  value,
  options,
  onValueChange,
  ariaLabel,
  label,
  placeholder = "Select",
  disabled = false,
  open,
  defaultOpen = false,
  onOpenChange,
  alignment = "start",
  popupAlignment = "left",
  fullWidth = false,
  loading = false,
  loadingContent = "Loading options...",
  emptyContent = "No options available.",
  popupHeader = null,
  popupHeaderClassName = "",
  popupContent = null,
  popupContentClassName = "",
  popupAriaLabel,
  popupWidth,
  popupMaxWidth,
  popupMaxHeight = "min(320px, calc(100vh - 32px))",
  triggerClassName = "",
  popupClassName = "",
  optionClassName = "",
  className = "",
  ...props
}: PlatformSelectorProps<TValue>, forwardedRef: Ref<HTMLDivElement>) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = open !== undefined;
  const resolvedOpen = controlled ? Boolean(open) : internalOpen;
  const listboxId = `platform-selector-${useId().replace(/:/g, "")}`;
  const hasCustomPopupContent = popupContent != null;
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) || null,
    [options, value],
  );
  const resolvedLabel = label ?? selectedOption?.label ?? placeholder;

  const commitOpen = useCallback((nextOpen: boolean) => {
    if (disabled && nextOpen) return;
    if (!controlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }, [controlled, disabled, onOpenChange]);

  function selectOption(option: PlatformSelectorOption<TValue>) {
    if (disabled || option.disabled) return;
    onValueChange?.(option.value, option);
    commitOpen(false);
    triggerRef.current?.focus();
  }

  function focusOption(index: number) {
    const optionButtons = Array.from(
      popupRef.current?.querySelectorAll<HTMLButtonElement>("[data-platform-selector-option]") || [],
    ).filter((button) => !button.disabled);
    if (!optionButtons.length) return;
    const normalizedIndex = (index + optionButtons.length) % optionButtons.length;
    optionButtons[normalizedIndex]?.focus();
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const optionButtons = Array.from(
      popupRef.current?.querySelectorAll<HTMLButtonElement>("[data-platform-selector-option]") || [],
    ).filter((button) => !button.disabled);
    const currentIndex = optionButtons.indexOf(event.currentTarget);
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      focusOption(currentIndex + 1);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      focusOption(currentIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusOption(optionButtons.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      commitOpen(false);
      triggerRef.current?.focus();
    }
  }

  useEffect(() => {
    if (!resolvedOpen) return undefined;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target instanceof Node ? event.target : null;
      if (
        !target
        || rootRef.current?.contains(target)
        || popupRef.current?.contains(target)
      ) return;
      commitOpen(false);
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      commitOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [commitOpen, resolvedOpen]);

  useEffect(() => {
    if (!resolvedOpen || loading || hasCustomPopupContent) return undefined;
    const timeout = window.setTimeout(() => {
      const selectedButton = Array.from(
        popupRef.current?.querySelectorAll<HTMLButtonElement>("[data-platform-selector-option]") || [],
      ).find((button) => button.dataset.platformSelectorOption === String(value));
      const firstButton = popupRef.current?.querySelector<HTMLButtonElement>(
        "[data-platform-selector-option]:not(:disabled)",
      );
      (selectedButton && !selectedButton.disabled ? selectedButton : firstButton)?.focus();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [hasCustomPopupContent, loading, resolvedOpen, value]);

  useEffect(() => {
    if (disabled && resolvedOpen) commitOpen(false);
  }, [commitOpen, disabled, resolvedOpen]);

  const setRootRef = (element: HTMLDivElement | null) => {
    rootRef.current = element;
    assignPlatformSelectorRef(forwardedRef, element);
  };

  return (
    <PlatformPopup
      open={resolvedOpen}
      rootRef={setRootRef}
      rootProps={props}
      rootClassName={joinPlatformSelectorClassNames(
        "platform-selector",
        `is-align-${alignment}`,
        `is-popup-align-${popupAlignment}`,
        fullWidth && "is-full-width",
        disabled && "is-disabled",
        className,
      )}
      surfaceRef={popupRef}
      surfaceClassName={joinPlatformSelectorClassNames(
        "platform-selector__popup",
        Boolean(popupHeader) && "has-popup-header",
        hasCustomPopupContent && "has-custom-content",
        popupClassName,
      )}
      surfaceProps={{
        id: hasCustomPopupContent ? listboxId : undefined,
        role: hasCustomPopupContent ? "dialog" : undefined,
        "aria-label": hasCustomPopupContent
          ? (popupAriaLabel || `${ariaLabel} options`)
          : undefined,
        width: popupWidth,
        maxWidth: popupMaxWidth,
        maxHeight: popupMaxHeight,
      }}
      animation="down-in"
      variant="minimal"
      portal
      placement={popupAlignment === "right" ? "bottom-end" : "bottom-start"}
      portalMatchAnchorWidth={popupWidth == null}
      trigger={
        <button
          type="button"
          ref={triggerRef}
          className={joinPlatformSelectorClassNames(
            "platform-selector__trigger",
            triggerClassName,
          )}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup={hasCustomPopupContent ? "dialog" : "listbox"}
          aria-controls={resolvedOpen ? listboxId : undefined}
          aria-expanded={resolvedOpen}
          onClick={() => commitOpen(!resolvedOpen)}
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
            event.preventDefault();
            commitOpen(true);
          }}
        >
          <span className="platform-selector__value">{resolvedLabel}</span>
          <ChevronsUpDown
            className="platform-selector__chevrons"
            width={14}
            height={14}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </button>
      }
    >
      {popupHeader ? (
        <div className={joinPlatformSelectorClassNames(
          "platform-selector__popup-header",
          popupHeaderClassName,
        )}>
          {popupHeader}
        </div>
      ) : null}
      {hasCustomPopupContent ? (
        <div className={joinPlatformSelectorClassNames(
          "platform-selector__custom-content",
          popupContentClassName,
        )}>
          {popupContent}
        </div>
      ) : (
        <fieldset
          id={listboxId}
          role="listbox"
          aria-label={`${ariaLabel} options`}
          className="platform-selector__listbox"
        >
          {loading ? (
            <div className="platform-selector__state" role="status">{loadingContent}</div>
          ) : options.length ? (
            options.map((option) => {
              const selected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-label={option.ariaLabel}
                  title={option.title}
                  disabled={option.disabled}
                  className={joinPlatformSelectorClassNames(
                    "platform-selector__option",
                    "tb-popup-row",
                    Boolean(option.leading) && "has-leading",
                    selected && "is-selected selected",
                    optionClassName,
                  )}
                  data-platform-selector-option={option.value}
                  onClick={() => selectOption(option)}
                  onKeyDown={handleOptionKeyDown}
                >
                  {option.leading ? (
                    <span className="platform-selector__option-leading" aria-hidden="true">
                      {option.leading}
                    </span>
                  ) : null}
                  <span className="platform-selector__option-copy">
                    <span className="platform-selector__option-label">{option.label}</span>
                    {option.description ? (
                      <span className="platform-selector__option-description">{option.description}</span>
                    ) : null}
                  </span>
                  <span className="platform-selector__option-check" aria-hidden="true">
                    {selected ? <Check width={13} height={13} strokeWidth={1.8} /> : null}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="platform-selector__state is-empty">{emptyContent}</div>
          )}
        </fieldset>
      )}
    </PlatformPopup>
  );
}) as <TValue extends string = string>(
  props: PlatformSelectorProps<TValue> & { ref?: Ref<HTMLDivElement> },
) => ReactNode;

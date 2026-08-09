import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export interface PlatformSwitchOption {
  value: string;
  label: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
  title?: string;
}

export interface PlatformSwitchProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> {
  value: string;
  options: readonly PlatformSwitchOption[];
  onValueChange: (value: string) => void;
  ariaLabel: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

function joinPlatformSwitchClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

export const PlatformSwitch = forwardRef<HTMLDivElement, PlatformSwitchProps>(
  function PlatformSwitch({
    value,
    options,
    onValueChange,
    ariaLabel,
    disabled = false,
    fullWidth = false,
    className = "",
    ...props
  }, ref) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [indicatorMetrics, setIndicatorMetrics] = useState<{
      offset: number;
      width: number;
    } | null>(null);
    const enabledOptionIndices = options.reduce<number[]>((indices, option, index) => {
      if (!disabled && !option.disabled) indices.push(index);
      return indices;
    }, []);
    const selectedIndex = options.findIndex((option) => option.value === value);
    const focusableIndex = enabledOptionIndices.includes(selectedIndex)
      ? selectedIndex
      : enabledOptionIndices[0] ?? -1;

    const setRootElement = useCallback((node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    const updateIndicatorMetrics = useCallback(() => {
      const root = rootRef.current;
      const selectedOption = selectedIndex >= 0
        ? root?.querySelector<HTMLElement>(
            `[data-platform-switch-option-index="${selectedIndex}"]`,
          )
        : null;
      if (!root || !selectedOption) {
        setIndicatorMetrics(null);
        return;
      }
      const nextMetrics = {
        offset: selectedOption.offsetLeft,
        width: selectedOption.offsetWidth,
      };
      setIndicatorMetrics((currentMetrics) => (
        currentMetrics
        && currentMetrics.offset === nextMetrics.offset
        && currentMetrics.width === nextMetrics.width
          ? currentMetrics
          : nextMetrics
      ));
    }, [selectedIndex]);

    useLayoutEffect(() => {
      updateIndicatorMetrics();
      const root = rootRef.current;
      if (!root) return undefined;

      const resizeObserver = typeof ResizeObserver === "function"
        ? new ResizeObserver(updateIndicatorMetrics)
        : null;
      resizeObserver?.observe(root);
      root.querySelectorAll<HTMLElement>("[data-platform-switch-option-index]")
        .forEach((option) => resizeObserver?.observe(option));
      window.addEventListener("resize", updateIndicatorMetrics);

      return () => {
        resizeObserver?.disconnect();
        window.removeEventListener("resize", updateIndicatorMetrics);
      };
    }, [options.length, updateIndicatorMetrics]);

    function selectOption(option: PlatformSwitchOption) {
      if (!disabled && !option.disabled && option.value !== value) {
        onValueChange(option.value);
      }
    }

    function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, optionIndex: number) {
      const isPrevious = event.key === "ArrowLeft" || event.key === "ArrowUp";
      const isNext = event.key === "ArrowRight" || event.key === "ArrowDown";
      const isBoundary = event.key === "Home" || event.key === "End";
      if ((!isPrevious && !isNext && !isBoundary) || enabledOptionIndices.length === 0) return;

      event.preventDefault();
      const currentEnabledIndex = enabledOptionIndices.indexOf(optionIndex);
      let nextOptionIndex = optionIndex;
      if (event.key === "Home") {
        nextOptionIndex = enabledOptionIndices[0];
      } else if (event.key === "End") {
        nextOptionIndex = enabledOptionIndices[enabledOptionIndices.length - 1];
      } else {
        const direction = isPrevious ? -1 : 1;
        const normalizedCurrentIndex = currentEnabledIndex >= 0 ? currentEnabledIndex : 0;
        const nextEnabledIndex = (
          normalizedCurrentIndex + direction + enabledOptionIndices.length
        ) % enabledOptionIndices.length;
        nextOptionIndex = enabledOptionIndices[nextEnabledIndex];
      }

      const nextOption = options[nextOptionIndex];
      if (!nextOption) return;
      selectOption(nextOption);
      const nextButton = event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(
        `[data-platform-switch-option-index="${nextOptionIndex}"]`
      );
      nextButton?.focus();
    }

    return (
      <div
        {...props}
        ref={setRootElement}
        role="radiogroup"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        className={joinPlatformSwitchClassNames(
          "platform-switch",
          disabled && "is-disabled",
          fullWidth && "is-full-width",
          className,
        )}
        data-platform-switch="true"
      >
        <span
          className="platform-switch__indicator"
          aria-hidden="true"
          style={indicatorMetrics
            ? {
                opacity: 1,
                width: `${indicatorMetrics.width}px`,
                transform: `translateX(${indicatorMetrics.offset}px)`,
              }
            : undefined}
        />
        {options.map((option, index) => {
          const isActive = option.value === value;
          const isDisabled = disabled || Boolean(option.disabled);
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={option.ariaLabel}
              className={joinPlatformSwitchClassNames("platform-switch__option", isActive && "is-active")}
              data-platform-switch-option={option.value}
              data-platform-switch-option-index={index}
              disabled={isDisabled}
              tabIndex={index === focusableIndex ? 0 : -1}
              title={option.title}
              onClick={() => selectOption(option)}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  }
);

import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
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
    const enabledOptionIndices = options.reduce<number[]>((indices, option, index) => {
      if (!disabled && !option.disabled) indices.push(index);
      return indices;
    }, []);
    const selectedIndex = options.findIndex((option) => option.value === value);
    const focusableIndex = enabledOptionIndices.includes(selectedIndex)
      ? selectedIndex
      : enabledOptionIndices[0] ?? -1;

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
        ref={ref}
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

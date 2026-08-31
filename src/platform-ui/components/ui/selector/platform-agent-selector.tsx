import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Check } from "../hugeicons-compat.js";
import { PlatformPopupSearchHeader } from "../../composite/popup/platform-popup-search-header.js";
import {
  PlatformSelector,
  type PlatformSelectorProps,
} from "./platform-selector.js";

export interface PlatformAgentSelectorOption<
  TValue extends string = string,
  TData = unknown,
> {
  value: TValue;
  name: string;
  avatarUrl?: string;
  searchText?: string;
  ariaLabel?: string;
  title?: string;
  disabled?: boolean;
  data?: TData;
}

export interface PlatformAgentAvatarProps {
  name: string;
  avatarUrl?: string;
  compact?: boolean;
  className?: string;
}

export interface PlatformAgentSelectorPopupProps<
  TValue extends string = string,
  TData = unknown,
> {
  value: TValue;
  options: readonly PlatformAgentSelectorOption<TValue, TData>[];
  onValueChange?: (
    value: TValue,
    option: PlatformAgentSelectorOption<TValue, TData>,
  ) => void;
  ariaLabel?: string;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  emptyContent?: ReactNode;
  loading?: boolean;
  loadingContent?: ReactNode;
  footer?: ReactNode;
  autoFocus?: boolean;
  className?: string;
  optionClassName?: string;
}

type PlatformAgentSelectorBaseProps<TValue extends string> = Omit<
  PlatformSelectorProps<TValue>,
  | "value"
  | "options"
  | "onValueChange"
  | "popupSearch"
  | "popupHeader"
  | "popupHeaderClassName"
  | "popupContent"
  | "popupContentClassName"
  | "popupAriaLabel"
  | "popupRole"
  | "popupAriaMultiselectable"
  | "optionClassName"
>;

export interface PlatformAgentSelectorProps<
  TValue extends string = string,
  TData = unknown,
> extends PlatformAgentSelectorBaseProps<TValue> {
  value: TValue;
  options: readonly PlatformAgentSelectorOption<TValue, TData>[];
  onValueChange?: (
    value: TValue,
    option: PlatformAgentSelectorOption<TValue, TData>,
  ) => void;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  emptyContent?: ReactNode;
  loading?: boolean;
  loadingContent?: ReactNode;
  footer?: ReactNode;
  optionClassName?: string;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => (
      typeof className === "string" && Boolean(className.trim())
    ))
    .map((className) => className.trim())
    .join(" ");
}

function getAgentInitials(name: string) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function PlatformAgentAvatar({
  name,
  avatarUrl = "",
  compact = false,
  className = "",
}: PlatformAgentAvatarProps) {
  const normalizedName = String(name || "Agent").trim() || "Agent";
  return (
    <span
      className={joinClassNames(
        "platform-agent-selector__avatar",
        compact && "is-compact",
        className,
      )}
      title={normalizedName}
      aria-hidden="true"
    >
      <span className="platform-agent-selector__avatar-fallback">
        {getAgentInitials(normalizedName)}
      </span>
      {avatarUrl ? (
        <img
          className="platform-agent-selector__avatar-image"
          src={avatarUrl}
          alt=""
          draggable={false}
        />
      ) : null}
    </span>
  );
}

export function PlatformAgentSelectorPopup<
  TValue extends string = string,
  TData = unknown,
>({
  value,
  options,
  onValueChange,
  ariaLabel = "Agents and squads",
  searchPlaceholder = "Search agents...",
  searchAriaLabel = "Search agents and squads",
  emptyContent = "No matching agents or squads.",
  loading = false,
  loadingContent = "Loading agents...",
  footer = null,
  autoFocus = true,
  className = "",
  optionClassName = "",
}: PlatformAgentSelectorPopupProps<TValue, TData>) {
  const [query, setQuery] = useState("");
  const listboxRef = useRef<HTMLFieldSetElement | null>(null);
  const normalizedOptions = useMemo(() => {
    const seenValues = new Set<string>();
    return options.filter((option) => {
      const normalizedValue = String(option.value || "").trim();
      if (!normalizedValue || seenValues.has(normalizedValue)) return false;
      seenValues.add(normalizedValue);
      return true;
    });
  }, [options]);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleOptions = useMemo(() => {
    if (!normalizedQuery) return normalizedOptions;
    return normalizedOptions.filter((option) => (
      [option.name, option.searchText, option.value]
        .map((entry) => String(entry || ""))
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedQuery)
    ));
  }, [normalizedOptions, normalizedQuery]);

  function getEnabledOptionButtons() {
    return Array.from(
      listboxRef.current?.querySelectorAll<HTMLButtonElement>(
        "[data-platform-agent-selector-option]",
      ) || [],
    ).filter((button) => !button.disabled);
  }

  function focusOption(index: number) {
    const optionButtons = getEnabledOptionButtons();
    if (!optionButtons.length) return;
    const normalizedIndex = (index + optionButtons.length) % optionButtons.length;
    optionButtons[normalizedIndex]?.focus();
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const optionButtons = getEnabledOptionButtons();
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
    }
  }

  return (
    <div className={joinClassNames("platform-agent-selector__popup-content", className)}>
      <div className="platform-popup__search-header">
        <PlatformPopupSearchHeader
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown") return;
            event.preventDefault();
            focusOption(0);
          }}
          placeholder={searchPlaceholder}
          aria-label={searchAriaLabel}
          autoFocus={autoFocus}
        />
      </div>
      <fieldset
        ref={listboxRef}
        role="listbox"
        aria-label={ariaLabel}
        className="platform-selector__listbox platform-agent-selector__listbox"
      >
        {loading ? (
          <div className="platform-selector__state" role="status">
            {loadingContent}
          </div>
        ) : visibleOptions.length ? (
          visibleOptions.map((option) => {
            const selected = option.value === value;
            const normalizedName = String(option.name || "Agent").trim() || "Agent";
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={option.ariaLabel || normalizedName}
                title={option.title}
                disabled={option.disabled}
                className={joinClassNames(
                  "platform-selector__option",
                  "has-leading",
                  "platform-agent-selector__option",
                  selected && "is-selected selected",
                  optionClassName,
                )}
                data-platform-agent-selector-option={option.value}
                onClick={() => onValueChange?.(option.value, option)}
                onKeyDown={handleOptionKeyDown}
              >
                <span className="platform-selector__option-leading" aria-hidden="true">
                  <PlatformAgentAvatar
                    name={normalizedName}
                    avatarUrl={option.avatarUrl}
                  />
                </span>
                <span className="platform-selector__option-copy">
                  <span
                    className="platform-selector__option-label platform-agent-selector__option-name"
                    title={option.title || normalizedName}
                  >
                    {normalizedName}
                  </span>
                </span>
                <span className="platform-selector__option-end" aria-hidden="true">
                  <span className="platform-selector__option-check">
                    {selected ? <Check width={13} height={13} strokeWidth={1.8} /> : null}
                  </span>
                </span>
              </button>
            );
          })
        ) : (
          <div className="platform-selector__state is-empty">{emptyContent}</div>
        )}
      </fieldset>
      {footer ? (
        <div className="platform-agent-selector__footer">{footer}</div>
      ) : null}
    </div>
  );
}

export function PlatformAgentSelector<
  TValue extends string = string,
  TData = unknown,
>({
  value,
  options,
  onValueChange,
  ariaLabel,
  label,
  placeholder = "Select agent",
  open,
  defaultOpen = false,
  onOpenChange,
  searchPlaceholder = "Search agents...",
  searchAriaLabel = "Search agents and squads",
  emptyContent = "No matching agents or squads.",
  loading = false,
  loadingContent = "Loading agents...",
  footer = null,
  className = "",
  triggerClassName = "",
  popupClassName = "",
  optionClassName = "",
  popupWidth = "min(280px, calc(100vw - 48px))",
  popupMaxHeight = "min(320px, calc(100vh - 120px))",
  ...props
}: PlatformAgentSelectorProps<TValue, TData>) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = open !== undefined;
  const resolvedOpen = controlled ? Boolean(open) : internalOpen;
  const selectedOption = options.find((option) => option.value === value) || null;
  const resolvedLabel = label ?? (selectedOption ? (
    <span className="platform-agent-selector__identity">
      <PlatformAgentAvatar
        name={selectedOption.name}
        avatarUrl={selectedOption.avatarUrl}
        compact
      />
      <span
        className="platform-agent-selector__selected-name"
        title={selectedOption.name}
      >
        {selectedOption.name}
      </span>
    </span>
  ) : placeholder);

  function commitOpen(nextOpen: boolean) {
    if (!controlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  return (
    <PlatformSelector
      {...props}
      value={value}
      options={[]}
      ariaLabel={ariaLabel}
      label={resolvedLabel}
      placeholder={placeholder}
      open={resolvedOpen}
      onOpenChange={commitOpen}
      popupContent={(
        <PlatformAgentSelectorPopup
          value={value}
          options={options}
          onValueChange={(nextValue, option) => {
            onValueChange?.(nextValue, option);
            commitOpen(false);
          }}
          ariaLabel={`${ariaLabel} options`}
          searchPlaceholder={searchPlaceholder}
          searchAriaLabel={searchAriaLabel}
          emptyContent={emptyContent}
          loading={loading}
          loadingContent={loadingContent}
          footer={footer}
          autoFocus={resolvedOpen}
          optionClassName={optionClassName}
        />
      )}
      popupAriaLabel={`${ariaLabel} options`}
      popupWidth={popupWidth}
      popupMaxHeight={popupMaxHeight}
      className={joinClassNames("platform-agent-selector", className)}
      triggerClassName={joinClassNames(
        "platform-agent-selector__trigger",
        triggerClassName,
      )}
      popupClassName={joinClassNames(
        "platform-agent-selector__popup",
        popupClassName,
      )}
    />
  );
}

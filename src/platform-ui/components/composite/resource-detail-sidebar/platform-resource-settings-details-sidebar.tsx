import { Check } from "../../ui/hugeicons-compat.js";
import {
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  formatPlatformResourceUpdatedAt,
  type PlatformResourceUpdatedAt,
} from "../../../formatting/index.js";
import { PlatformPrimaryButton } from "../../ui/button/index.js";
import {
  PlatformButtonSelector,
  PlatformSelector,
} from "../../ui/selector/index.js";
import type {
  PlatformOwnerIdentity,
  PlatformOwnerOption,
} from "../owner-selector/index.js";
import {
  PlatformResourceDetailSidebar,
  type PlatformResourceDetailSidebarAttribute,
  type PlatformResourceDetailSidebarOwnerSelectorProps,
} from "./platform-resource-detail-sidebar.js";

export interface PlatformResourceSettingsScopeOption {
  value: string;
  label: string;
  leading?: ReactNode;
  disabled?: boolean;
}

export interface PlatformResourceSettingsScopeProps {
  values?: readonly string[];
  options?: readonly PlatformResourceSettingsScopeOption[];
  onValuesChange?: (values: readonly string[]) => void | Promise<void>;
  ariaLabel?: string;
  title?: string;
  independentLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingContent?: ReactNode;
  emptyContent?: ReactNode;
}

export interface PlatformResourceSettingsPrimaryAction {
  id: string;
  label: string;
  onSelect?: () => void | Promise<void>;
  disabled?: boolean;
  title?: string;
}

export interface PlatformResourceSettingsDetailsSidebarProps<
  TValue extends string = string,
  TData = unknown,
> {
  /** Resource-specific rows always render above the invariant rows. */
  customAttributes?: readonly PlatformResourceDetailSidebarAttribute[];
  updatedAt: PlatformResourceUpdatedAt;
  creator: PlatformOwnerIdentity;
  owner: PlatformOwnerIdentity<TValue>;
  ownerOptions?: readonly PlatformOwnerOption<TValue, TData>[];
  onOwnerTransfer?: (
    value: TValue,
    option: PlatformOwnerOption<TValue, TData>,
  ) => void | Promise<void>;
  ownerSelectorProps?: PlatformResourceDetailSidebarOwnerSelectorProps<TValue, TData>;
  /** Pass false only for Project Settings, where Scope would be self-referential. */
  scope?: PlatformResourceSettingsScopeProps | false;
  /** One action renders a button; multiple actions render a split selector. */
  primaryActions: readonly [
    PlatformResourceSettingsPrimaryAction,
    ...PlatformResourceSettingsPrimaryAction[],
  ];
  children?: ReactNode;
  className?: string;
  propertiesClassName?: string;
}

function normalizeScopeValues(values: readonly string[] = []) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function focusSiblingScopeOption(
  event: KeyboardEvent<HTMLButtonElement>,
  offset: number | "first" | "last",
) {
  const listbox = event.currentTarget.closest("[role='listbox']");
  const options = Array.from(
    listbox?.querySelectorAll<HTMLButtonElement>(
      "[data-platform-resource-scope-option]:not(:disabled)",
    ) || [],
  );
  if (!options.length) return;
  const currentIndex = options.indexOf(event.currentTarget);
  const nextIndex = offset === "first"
    ? 0
    : offset === "last"
      ? options.length - 1
      : (currentIndex + offset + options.length) % options.length;
  options[nextIndex]?.focus();
}

function handleScopeOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
  if (event.key === "ArrowDown" || event.key === "ArrowRight") {
    event.preventDefault();
    focusSiblingScopeOption(event, 1);
  } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
    event.preventDefault();
    focusSiblingScopeOption(event, -1);
  } else if (event.key === "Home") {
    event.preventDefault();
    focusSiblingScopeOption(event, "first");
  } else if (event.key === "End") {
    event.preventDefault();
    focusSiblingScopeOption(event, "last");
  }
}

function PlatformResourceSettingsScopeSelector({
  values = [],
  options = [],
  onValuesChange,
  ariaLabel = "Choose resource scope",
  title,
  independentLabel = "Independent",
  disabled = false,
  loading = false,
  loadingContent = "Loading Projects…",
  emptyContent = "No Projects are available.",
}: PlatformResourceSettingsScopeProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const normalizedValues = useMemo(() => normalizeScopeValues(values), [values]);
  const selectedValues = useMemo(() => new Set(normalizedValues), [normalizedValues]);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleOptions = useMemo(() => (
    normalizedQuery
      ? options.filter((option) => option.label.toLocaleLowerCase().includes(normalizedQuery))
      : options
  ), [normalizedQuery, options]);
  const selectedOptions = normalizedValues
    .map((value) => options.find((option) => option.value === value))
    .filter((option): option is PlatformResourceSettingsScopeOption => Boolean(option));
  const labelText = normalizedValues.length === 0
    ? independentLabel
    : normalizedValues.length === 1
      ? selectedOptions[0]?.label || normalizedValues[0]
      : `${normalizedValues.length} Projects`;
  const label = normalizedValues.length === 1 && selectedOptions[0]?.leading ? (
    <>
      <span
        className="platform-resource-settings-details__scope-leading"
        aria-hidden="true"
      >
        {selectedOptions[0].leading}
      </span>
      <span className="platform-resource-settings-details__scope-label">{labelText}</span>
    </>
  ) : labelText;
  const commitValues = (nextValues: readonly string[]) => {
    if (disabled || !onValuesChange) return;
    void onValuesChange(normalizeScopeValues(nextValues));
  };

  const renderOption = (
    option: PlatformResourceSettingsScopeOption,
    selected: boolean,
    onSelect: () => void,
  ) => (
    <button
      key={option.value}
      type="button"
      role="option"
      aria-selected={selected}
      disabled={disabled || option.disabled}
      className={`platform-selector__option tb-popup-row${option.leading ? " has-leading" : ""}${selected ? " is-selected selected" : ""}`}
      data-platform-resource-scope-option={option.value}
      onClick={onSelect}
      onKeyDown={handleScopeOptionKeyDown}
    >
      {option.leading ? (
        <span className="platform-selector__option-leading" aria-hidden="true">
          {option.leading}
        </span>
      ) : null}
      <span className="platform-selector__option-copy">
        <span className="platform-selector__option-label">{option.label}</span>
      </span>
      <span className="platform-selector__option-end" aria-hidden="true">
        <span className="platform-selector__option-check">
          {selected ? <Check width={13} height={13} strokeWidth={1.8} /> : null}
        </span>
      </span>
    </button>
  );

  return (
    <PlatformSelector
      value={normalizedValues[0] || "__independent__"}
      options={[]}
      label={label}
      ariaLabel={ariaLabel}
      title={title}
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setQuery("");
      }}
      alignment="end"
      popupAlignment="right"
      fullWidth
      disabled={disabled || !onValuesChange}
      popupWidth="min(280px, calc(100vw - 48px))"
      popupMaxWidth="calc(100vw - 48px)"
      popupMaxHeight="min(360px, calc(100vh - 120px))"
      popupAriaLabel="Resource scope"
      popupRole="listbox"
      popupAriaMultiselectable
      popupSearch={options.length > 6 ? {
        value: query,
        onChange: (event) => setQuery(event.currentTarget.value),
        placeholder: "Search Projects",
        "aria-label": "Search Projects",
        showSearchIcon: true,
      } : null}
      popupContent={(
        <div
          className="platform-resource-settings-details__scope-options"
        >
          {renderOption(
            { value: "__independent__", label: independentLabel },
            normalizedValues.length === 0,
            () => commitValues([]),
          )}
          {loading ? (
            <div className="platform-selector__state" role="status">{loadingContent}</div>
          ) : visibleOptions.length ? visibleOptions.map((option) => renderOption(
            option,
            selectedValues.has(option.value),
            () => commitValues(
              selectedValues.has(option.value)
                ? normalizedValues.filter((value) => value !== option.value)
                : [...normalizedValues, option.value],
            ),
          )) : (
            <div className="platform-selector__state">{emptyContent}</div>
          )}
        </div>
      )}
      className="platform-resource-settings-details__scope-selector"
      triggerClassName="platform-resource-settings-details__scope-trigger"
      popupClassName="platform-resource-settings-details__scope-popup"
    />
  );
}

function PlatformResourceSettingsPrimaryActions({
  actions,
}: {
  actions: PlatformResourceSettingsDetailsSidebarProps["primaryActions"];
}) {
  const [primaryAction, ...alternativeActions] = actions;
  if (!primaryAction) return null;
  if (!alternativeActions.length) {
    return (
      <PlatformPrimaryButton
        fullWidth
        size="small"
        className="platform-resource-settings-details__primary-action"
        disabled={primaryAction.disabled || !primaryAction.onSelect}
        title={primaryAction.title}
        onClick={() => void primaryAction.onSelect?.()}
      >
        {primaryAction.label}
      </PlatformPrimaryButton>
    );
  }

  return (
    <PlatformButtonSelector
      mode="split-action"
      buttonVariant="primary"
      buttonSize="small"
      label={primaryAction.label}
      actionAriaLabel={primaryAction.label}
      popupAriaLabel="Resource actions"
      popupAlignment="right"
      popupRole="menu"
      popupVariant="minimal"
      popupWidth={220}
      closeOnSelect
      fullWidth
      className="platform-resource-settings-details__primary-action platform-resource-settings-details__primary-action-selector"
      actionDisabled={primaryAction.disabled || !primaryAction.onSelect}
      popupDisabled={alternativeActions.every((action) => action.disabled || !action.onSelect)}
      onAction={() => primaryAction.onSelect?.()}
    >
      {alternativeActions.map((action) => (
        <button
          key={action.id}
          type="button"
          role="menuitem"
          className="platform-data-table__menu-item"
          disabled={action.disabled || !action.onSelect}
          title={action.title}
          onClick={() => void action.onSelect?.()}
        >
          <span className="platform-data-table__menu-copy">{action.label}</span>
        </button>
      ))}
    </PlatformButtonSelector>
  );
}

/**
 * Canonical Settings sidebar. Custom rows are intentionally the only rows a
 * resource can prepend; invariant metadata and the footer action stay ordered
 * and visually consistent across every Settings page.
 */
export function PlatformResourceSettingsDetailsSidebar<
  TValue extends string = string,
  TData = unknown,
>({
  customAttributes = [],
  updatedAt,
  creator,
  owner,
  ownerOptions = [],
  onOwnerTransfer,
  ownerSelectorProps,
  scope,
  primaryActions,
  children,
  className = "",
  propertiesClassName = "",
}: PlatformResourceSettingsDetailsSidebarProps<TValue, TData>) {
  const resolvedScope = scope === undefined ? {} : scope;
  return (
    <PlatformResourceDetailSidebar<TValue, TData>
      attributes={[
        ...customAttributes,
        ...(resolvedScope !== false ? [{
          id: "scope",
          label: "Scope",
          value: <PlatformResourceSettingsScopeSelector {...resolvedScope} />,
          className: "platform-resource-settings-details__scope-row",
        }] : []),
        {
          id: "updated",
          label: "Updated",
          value: formatPlatformResourceUpdatedAt(updatedAt),
          className: "platform-resource-settings-details__updated-row",
        },
      ]}
      creator={creator}
      owner={owner}
      ownerOptions={ownerOptions}
      onOwnerTransfer={onOwnerTransfer}
      ownerSelectorProps={ownerSelectorProps}
      primaryAction={<PlatformResourceSettingsPrimaryActions actions={primaryActions} />}
      className={`platform-resource-settings-details${className ? ` ${className}` : ""}`}
      propertiesClassName={`platform-resource-settings-details__properties${propertiesClassName ? ` ${propertiesClassName}` : ""}`}
    >
      {children}
    </PlatformResourceDetailSidebar>
  );
}

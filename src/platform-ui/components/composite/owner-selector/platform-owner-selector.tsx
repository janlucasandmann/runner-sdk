import { useMemo, useState, type ReactNode } from "react";
import {
  PlatformSelector,
  type PlatformSelectorAlignment,
  type PlatformSelectorPopupAlignment,
} from "../../ui/selector/index.js";
import { PlatformConfirmationModal } from "../modal/index.js";

export interface PlatformOwnerIdentity<TValue extends string = string> {
  value: TValue;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface PlatformOwnerOption<
  TValue extends string = string,
  TData = unknown,
> extends PlatformOwnerIdentity<TValue> {
  description?: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
  data?: TData;
}

export interface PlatformOwnerSelectorProps<
  TValue extends string = string,
  TData = unknown,
> {
  owner: PlatformOwnerIdentity<TValue>;
  options: readonly PlatformOwnerOption<TValue, TData>[];
  onTransfer: (
    value: TValue,
    option: PlatformOwnerOption<TValue, TData>,
  ) => void | Promise<void>;
  ariaLabel?: string;
  resourceLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingContent?: ReactNode;
  emptyContent?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  alignment?: PlatformSelectorAlignment;
  popupAlignment?: PlatformSelectorPopupAlignment;
  fullWidth?: boolean;
  popupWidth?: number | string;
  popupMaxHeight?: string;
  className?: string;
  triggerClassName?: string;
  popupClassName?: string;
  optionClassName?: string;
  confirmationTitle?: ReactNode | ((option: PlatformOwnerOption<TValue, TData>) => ReactNode);
  confirmationDescription?: ReactNode | ((option: PlatformOwnerOption<TValue, TData>) => ReactNode);
  confirmLabel?: ReactNode;
  confirmingLabel?: ReactNode;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

function getInitials(value: string) {
  const parts = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  return parts.slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase();
}

function PlatformOwnerAvatar({ identity }: { identity: PlatformOwnerIdentity }) {
  return (
    <span className="platform-owner-selector__avatar" aria-hidden="true">
      <span className="platform-owner-selector__avatar-fallback">
        {getInitials(identity.name || identity.email || "Owner")}
      </span>
      {identity.avatarUrl ? (
        <img
          className="platform-owner-selector__avatar-image"
          src={identity.avatarUrl}
          alt=""
        />
      ) : null}
    </span>
  );
}

function resolveContent<TValue extends string, TData>(
  value: ReactNode | ((option: PlatformOwnerOption<TValue, TData>) => ReactNode) | undefined,
  option: PlatformOwnerOption<TValue, TData>,
) {
  return typeof value === "function" ? value(option) : value;
}

export function PlatformOwnerSelector<
  TValue extends string = string,
  TData = unknown,
>({
  owner,
  options,
  onTransfer,
  ariaLabel = "Choose owner",
  resourceLabel = "resource",
  disabled = false,
  loading = false,
  loadingContent = "Loading organization members...",
  emptyContent = "No active organization members are available.",
  open,
  onOpenChange,
  alignment = "start",
  popupAlignment = "right",
  fullWidth = true,
  popupWidth = 260,
  popupMaxHeight = "min(320px, calc(100vh - 180px))",
  className = "",
  triggerClassName = "",
  popupClassName = "",
  optionClassName = "",
  confirmationTitle,
  confirmationDescription,
  confirmLabel = "Transfer Ownership",
  confirmingLabel = "Transferring...",
}: PlatformOwnerSelectorProps<TValue, TData>) {
  const [pendingOption, setPendingOption] = useState<PlatformOwnerOption<TValue, TData> | null>(null);
  const normalizedOptions = useMemo(() => options.map((option) => ({
    value: option.value,
    label: option.name,
    description: option.description ?? (
      option.email && option.email.toLowerCase() !== option.name.toLowerCase()
        ? option.email
        : undefined
    ),
    ariaLabel: option.ariaLabel || (
      option.email && option.email.toLowerCase() !== option.name.toLowerCase()
        ? `${option.name}, ${option.email}`
        : option.name
    ),
    disabled: option.disabled || option.value === owner.value,
    leading: <PlatformOwnerAvatar identity={option} />,
    ownerOption: option,
  })), [options, owner.value]);

  const selectedOption = normalizedOptions.find((option) => option.value === owner.value);
  const selectorOptions = selectedOption
    ? normalizedOptions
    : [{
        value: owner.value,
        label: owner.name,
        description: owner.email || undefined,
        ariaLabel: owner.email ? `${owner.name}, ${owner.email}` : owner.name,
        disabled: true,
        leading: <PlatformOwnerAvatar identity={owner} />,
        ownerOption: { ...owner, disabled: true } as PlatformOwnerOption<TValue, TData>,
      }, ...normalizedOptions];

  const resolvedConfirmationTitle = pendingOption
    ? resolveContent(confirmationTitle, pendingOption)
      || `Transfer ${resourceLabel} ownership?`
    : "Transfer ownership?";
  const resolvedConfirmationDescription = pendingOption
    ? resolveContent(confirmationDescription, pendingOption)
      || `Transfer ownership to ${pendingOption.name}? You will lose owner privileges and cannot take the owner role back yourself.`
    : null;

  return (
    <>
      <PlatformSelector
        value={owner.value}
        options={selectorOptions}
        onValueChange={(_value, option) => setPendingOption(option.ownerOption)}
        ariaLabel={ariaLabel}
        label={(
          <span className="platform-owner-selector__identity">
            <PlatformOwnerAvatar identity={owner} />
            <span
              className="platform-owner-selector__name"
              title={owner.email ? `${owner.name} · ${owner.email}` : owner.name}
            >
              {owner.name}
            </span>
          </span>
        )}
        disabled={disabled}
        loading={loading}
        loadingContent={loadingContent}
        emptyContent={emptyContent}
        open={open}
        onOpenChange={onOpenChange}
        alignment={alignment}
        popupAlignment={popupAlignment}
        fullWidth={fullWidth}
        popupWidth={popupWidth}
        popupMaxHeight={popupMaxHeight}
        className={joinClassNames("platform-owner-selector", className)}
        triggerClassName={joinClassNames("platform-owner-selector__trigger", triggerClassName)}
        popupClassName={joinClassNames("platform-owner-selector__popup", popupClassName)}
        optionClassName={joinClassNames("platform-owner-selector__option", optionClassName)}
      />
      <PlatformConfirmationModal
        open={Boolean(pendingOption)}
        title={resolvedConfirmationTitle}
        description={resolvedConfirmationDescription}
        confirmLabel={confirmLabel}
        confirmingLabel={confirmingLabel}
        errorFallback={`The ${resourceLabel} owner could not be changed.`}
        onCancel={() => setPendingOption(null)}
        onConfirm={async () => {
          if (!pendingOption) return;
          await onTransfer(pendingOption.value, pendingOption);
          setPendingOption(null);
        }}
      />
    </>
  );
}

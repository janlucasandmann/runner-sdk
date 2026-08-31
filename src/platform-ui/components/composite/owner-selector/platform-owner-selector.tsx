import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  PlatformSelector,
  type PlatformSelectorAlignment,
  type PlatformSelectorPopupAlignment,
} from "../../ui/selector/index.js";
import { PlatformConfirmationModal } from "../modal/index.js";
import { usePlatformOrganizationMemberDirectory } from "./platform-organization-member-directory.js";

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
  title?: string;
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
  title?: string;
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
  /**
   * Includes every active member from the organization directory in addition
   * to resource-specific candidates. Team ownership is the exceptional case
   * and should disable this because a team owner must already belong to it.
   */
  includeOrganizationMembers?: boolean;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

function hasTrustedOwnerName(identity: PlatformOwnerIdentity): boolean {
  const name = String(identity.name || "").replace(/\s+/g, " ").trim();
  const email = String(identity.email || "").trim().toLowerCase();
  if (!name || ["you", "me", "current user", "unknown", "unknown user"].includes(name.toLowerCase())) {
    return false;
  }
  const emailLocalPart = email.includes("@") ? email.split("@")[0] || "" : "";
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normalizedEmailLocalPart = emailLocalPart.replace(/[^a-z0-9]/g, "");
  return !name.includes("@")
    && (!email || name.toLowerCase() !== email)
    && (!normalizedEmailLocalPart || normalizedName !== normalizedEmailLocalPart);
}

export function getPlatformOwnerDisplayName(identity: PlatformOwnerIdentity): string {
  const name = String(identity.name || "").replace(/\s+/g, " ").trim();
  if (hasTrustedOwnerName(identity)) return name;
  const email = String(identity.email || (name.includes("@") ? name : "")).trim();
  const prefix = email.includes("@") ? email.split("@")[0] : "";
  const derivedName = prefix
    .split(/[^a-zA-Z0-9]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return derivedName || name || "Unknown user";
}

function resolveOwnerIdentity<TValue extends string, TData>(
  owner: PlatformOwnerIdentity<TValue>,
  options: readonly PlatformOwnerOption<TValue, TData>[],
): PlatformOwnerIdentity<TValue> {
  const matchingOption = options.find((option) => option.value === owner.value);
  if (!matchingOption) return owner;
  const optionHasAvatar = Object.hasOwn(matchingOption, "avatarUrl");
  return {
    ...owner,
    name: hasTrustedOwnerName(owner) || !hasTrustedOwnerName(matchingOption)
      ? owner.name
      : matchingOption.name,
    email: matchingOption.email || owner.email,
    // The organization directory is authoritative even when it explicitly
    // reports that a member has no image. This prevents a stale/current-user
    // avatar from leaking into another member's identity.
    avatarUrl: optionHasAvatar ? matchingOption.avatarUrl : owner.avatarUrl,
  };
}

function getOwnerOptionKeys(option: PlatformOwnerOption<string, unknown>): string[] {
  return Array.from(new Set([
    option.value,
    option.email,
  ].map((entry) => String(entry || "").trim().toLowerCase()).filter(Boolean)));
}

function mergeOwnerOptions<TValue extends string, TData>(
  options: readonly PlatformOwnerOption<TValue, TData>[],
  organizationOptions: readonly PlatformOwnerOption<TValue, TData>[],
): PlatformOwnerOption<TValue, TData>[] {
  const merged = [...options];
  const indexByKey = new Map<string, number>();
  merged.forEach((option, index) => {
    getOwnerOptionKeys(option as PlatformOwnerOption<string, unknown>)
      .forEach((key) => {
        indexByKey.set(key, index);
      });
  });
  organizationOptions.forEach((organizationOption) => {
    const keys = getOwnerOptionKeys(organizationOption as PlatformOwnerOption<string, unknown>);
    const existingIndex = keys.map((key) => indexByKey.get(key)).find((index) => index !== undefined);
    if (existingIndex === undefined) {
      const nextIndex = merged.length;
      merged.push(organizationOption);
      keys.forEach((key) => {
        indexByKey.set(key, nextIndex);
      });
      return;
    }
    const existing = merged[existingIndex];
    merged[existingIndex] = {
      ...organizationOption,
      ...existing,
      name: organizationOption.name || existing.name,
      email: organizationOption.email || existing.email,
      // The organization profile directory is authoritative. An empty value
      // deliberately keeps the initials fallback instead of borrowing another
      // user's locally supplied avatar.
      avatarUrl: organizationOption.avatarUrl || "",
      data: existing.data ?? organizationOption.data,
    };
    keys.forEach((key) => {
      indexByKey.set(key, existingIndex);
    });
  });
  return merged;
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
  const displayName = getPlatformOwnerDisplayName(identity);
  return (
    <span className="platform-owner-selector__avatar" aria-hidden="true">
      <span className="platform-owner-selector__avatar-fallback">
        {getInitials(displayName)}
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
  title,
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
  includeOrganizationMembers = true,
}: PlatformOwnerSelectorProps<TValue, TData>) {
  const [pendingOption, setPendingOption] = useState<PlatformOwnerOption<TValue, TData> | null>(null);
  const [query, setQuery] = useState("");
  const organizationDirectory = usePlatformOrganizationMemberDirectory();
  const organizationOptions = useMemo<PlatformOwnerOption<TValue, TData>[]>(() => (
    includeOrganizationMembers
      ? organizationDirectory.candidates.map((candidate) => {
          const identity = {
            value: candidate.value,
            id: candidate.id,
            userId: candidate.userId,
            name: candidate.name,
            email: candidate.email || "",
            avatarUrl: candidate.avatarUrl || "",
          };
          return {
            value: candidate.value as TValue,
            name: candidate.name,
            email: candidate.email || "",
            avatarUrl: candidate.avatarUrl || "",
            data: {
              identity,
              candidate: identity,
              owner: identity,
              source: candidate.source,
            } as TData,
          };
        })
      : []
  ), [includeOrganizationMembers, organizationDirectory.candidates]);
  const mergedOptions = useMemo(
    () => mergeOwnerOptions(options, organizationOptions),
    [options, organizationOptions],
  );
  const resolvedOwner = useMemo(
    () => resolveOwnerIdentity(owner, mergedOptions),
    [mergedOptions, owner],
  );
  const normalizedOptions = useMemo(() => mergedOptions.map((option) => {
    const displayName = getPlatformOwnerDisplayName(option);
    return {
      value: option.value,
      label: displayName,
      ariaLabel: displayName,
      disabled: option.disabled || option.value === owner.value,
      leading: <PlatformOwnerAvatar identity={option} />,
    };
  }), [mergedOptions, owner.value]);
  const ownerOptionByValue = useMemo(
    () => new Map(mergedOptions.map((option) => [option.value, option])),
    [mergedOptions],
  );
  useEffect(() => {
    if (
      !includeOrganizationMembers
      || !organizationDirectory.organizationId
    ) return undefined;

    // Child effects run before the provider's cache-key synchronization effect.
    // Defer the first request by one microtask so its generation cannot be
    // invalidated while the organization context finishes initializing.
    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) void organizationDirectory.ensureLoaded();
    });
    return () => {
      cancelled = true;
    };
  }, [
    includeOrganizationMembers,
    organizationDirectory.ensureLoaded,
    organizationDirectory.organizationId,
  ]);

  const selectedOption = normalizedOptions.find((option) => option.value === owner.value);
  const selectorOptions = selectedOption
    ? normalizedOptions
    : [{
        value: owner.value,
        label: getPlatformOwnerDisplayName(resolvedOwner),
        ariaLabel: getPlatformOwnerDisplayName(resolvedOwner),
        disabled: true,
        leading: <PlatformOwnerAvatar identity={resolvedOwner} />,
      }, ...normalizedOptions];
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleSelectorOptions = normalizedQuery
    ? selectorOptions.filter((option) =>
        String(option.label).toLocaleLowerCase().includes(normalizedQuery),
      )
    : selectorOptions;

  const resolvedConfirmationTitle = pendingOption
    ? resolveContent(confirmationTitle, pendingOption)
      || `Transfer ${resourceLabel} ownership?`
    : "Transfer ownership?";
  const resolvedConfirmationDescription = pendingOption
    ? resolveContent(confirmationDescription, pendingOption)
      || `Transfer ownership to ${getPlatformOwnerDisplayName(pendingOption)}? This action is irreversible. You will lose your owner permission entitlements immediately and cannot take the owner role back yourself.`
    : null;

  return (
    <>
      <PlatformSelector
        value={owner.value}
        options={visibleSelectorOptions}
        onValueChange={(value) => {
          const nextOwner = ownerOptionByValue.get(value);
          if (nextOwner) setPendingOption(nextOwner);
        }}
        ariaLabel={ariaLabel}
        title={title}
        label={(
          <span className="platform-owner-selector__identity">
            <PlatformOwnerAvatar identity={resolvedOwner} />
            <span
              className="platform-owner-selector__name"
              title={getPlatformOwnerDisplayName(resolvedOwner)}
            >
              {getPlatformOwnerDisplayName(resolvedOwner)}
            </span>
          </span>
        )}
        disabled={disabled}
        loading={loading || Boolean(
          includeOrganizationMembers
          && organizationDirectory.organizationId
          && organizationDirectory.status === "loading"
        )}
        loadingContent={loadingContent}
        emptyContent={emptyContent}
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen && includeOrganizationMembers) void organizationDirectory.ensureLoaded();
          if (!nextOpen) setQuery("");
          onOpenChange?.(nextOpen);
        }}
        alignment={alignment}
        popupAlignment={popupAlignment}
        fullWidth={fullWidth}
        popupWidth={popupWidth}
        popupMaxHeight={popupMaxHeight}
        popupSearch={{
          value: query,
          onChange: (event) => setQuery(event.currentTarget.value),
          placeholder: "Search people",
          "aria-label": "Search owners",
          showSearchIcon: true,
        }}
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

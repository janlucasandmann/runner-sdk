import Copy01Icon from "@hugeicons/core-free-icons/Copy01Icon";
import HistoryIcon from "@hugeicons/core-free-icons/HistoryIcon";
import Share01Icon from "@hugeicons/core-free-icons/Share01Icon";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type ButtonHTMLAttributes,
  createContext,
  type HTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Check, ChevronRight, Copy, Ellipsis, Info } from "../../ui/hugeicons-compat.js";
import { PlatformIconButton } from "../../ui/icon-button/index.js";
import {
  normalizePlatformVersionNumber,
  PlatformVersionLabel,
  type PlatformVersionLabelProps,
} from "../../ui/version-label/index.js";
import { PlatformPopup, type PlatformPopupPlacement } from "../popup/index.js";

const PlatformResourceActionsMenuContext = createContext<{ ownerId: string } | null>(null);

export type PlatformResourceActionShortcut = "share" | "rename" | "delete";

interface PlatformResourceActionShortcutDefinition {
  key: string;
  code: string;
  label: string;
  ariaKeyShortcuts: string;
  altKey: boolean;
  shiftKey: boolean;
}

const PLATFORM_RESOURCE_ACTION_SHORTCUTS: Record<
  PlatformResourceActionShortcut,
  PlatformResourceActionShortcutDefinition
> = {
  share: {
    key: "s",
    code: "KeyS",
    label: "⌘ ⌥ S",
    ariaKeyShortcuts: "Meta+Alt+S Control+Alt+S",
    altKey: true,
    shiftKey: false,
  },
  rename: {
    key: "r",
    code: "KeyR",
    label: "⌘ ⌥ R",
    ariaKeyShortcuts: "Meta+Alt+R Control+Alt+R",
    altKey: true,
    shiftKey: false,
  },
  delete: {
    key: "Backspace",
    code: "Backspace",
    label: "⌘ ⌥ ⌫",
    ariaKeyShortcuts: "Meta+Alt+Backspace Control+Alt+Backspace",
    altKey: true,
    shiftKey: false,
  },
};

export interface PlatformResourceActionShortcutAction {
  onInvoke: () => void;
  disabled?: boolean;
}

export type PlatformResourceActionShortcutActions = Partial<Record<
  PlatformResourceActionShortcut,
  PlatformResourceActionShortcutAction
>>;

function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

function matchesResourceActionShortcut(
  event: KeyboardEvent,
  shortcut: PlatformResourceActionShortcut,
): boolean {
  const definition = PLATFORM_RESOURCE_ACTION_SHORTCUTS[shortcut];
  return (event.metaKey || event.ctrlKey)
    && event.altKey === definition.altKey
    && event.shiftKey === definition.shiftKey
    && (
      event.code === definition.code
      || event.key.toLowerCase() === definition.key.toLowerCase()
    );
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

export interface PlatformResourceHeaderActionsProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

export function PlatformResourceHeaderActions({
  children,
  className = "",
  ...props
}: PlatformResourceHeaderActionsProps) {
  return (
    <span {...props} className={joinClassNames("platform-resource-header-actions", className)}>
      {children}
    </span>
  );
}

export interface PlatformResourceVersionLabelProps
  extends Omit<PlatformVersionLabelProps, "aria-label" | "onClick" | "qualifier"> {
  resourceLabel: string;
  latestVersion?: string | number | null;
  isLatest?: boolean;
  onOpenVersionHistory: MouseEventHandler<HTMLButtonElement>;
}

export function PlatformResourceVersionLabel({
  resourceLabel,
  version,
  latestVersion,
  isLatest,
  onOpenVersionHistory,
  className = "",
  ...props
}: PlatformResourceVersionLabelProps) {
  const resolvedIsLatest =
    typeof isLatest === "boolean"
      ? isLatest
      : latestVersion !== null &&
        latestVersion !== undefined &&
        normalizePlatformVersionNumber(version) === normalizePlatformVersionNumber(latestVersion);
  const normalizedResourceLabel = String(resourceLabel || "resource").trim() || "resource";

  return (
    <PlatformVersionLabel
      {...props}
      version={version}
      qualifier={resolvedIsLatest ? "Latest" : undefined}
      className={joinClassNames("platform-resource-header-version-label", className)}
      aria-label={`Open ${normalizedResourceLabel} version history`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onOpenVersionHistory(event);
      }}
    />
  );
}

export interface PlatformResourceActionsMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceLabel: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  popupClassName?: string;
  width?: number | string;
  maxWidth?: number | string;
  placement?: PlatformPopupPlacement;
  shortcutActions?: PlatformResourceActionShortcutActions;
}

export function PlatformResourceActionsMenu({
  open,
  onOpenChange,
  resourceLabel,
  children,
  disabled = false,
  className = "",
  popupClassName = "",
  width = 240,
  maxWidth = "calc(100vw - 16px)",
  placement = "bottom-start",
  shortcutActions = {},
}: PlatformResourceActionsMenuProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const ownerId = useId();
  const normalizedResourceLabel = String(resourceLabel || "Resource").trim() || "Resource";
  const actionsLabel = `${normalizedResourceLabel} actions`;

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const hasShortcutActions = Object.keys(shortcutActions).length > 0;
    if (!open && !hasShortcutActions) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target) || surfaceRef.current?.contains(target)) return;
      const targetElement = target instanceof Element ? target : target.parentElement;
      const ownedPopup = targetElement?.closest("[data-platform-resource-actions-owner]");
      if (ownedPopup?.getAttribute("data-platform-resource-actions-owner") === ownerId) return;
      onOpenChange(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!open) return;
        event.preventDefault();
        onOpenChange(false);
        return;
      }
      if (
        disabled
        || event.repeat
        || event.isComposing
        || isEditableShortcutTarget(event.target)
      ) return;
      const shortcutActionEntry = Object.entries(shortcutActions).find(
        ([shortcut, action]) => (
          !action?.disabled
          && matchesResourceActionShortcut(
            event,
            shortcut as PlatformResourceActionShortcut,
          )
        ),
      );
      if (shortcutActionEntry?.[1]) {
        event.preventDefault();
        event.stopPropagation();
        if (open) onOpenChange(false);
        shortcutActionEntry[1].onInvoke();
        return;
      }
      if (!open) return;
      const shortcutButtons = surfaceRef.current?.querySelectorAll<HTMLButtonElement>(
        "button[data-platform-resource-action-shortcut]",
      );
      const shortcutButton = Array.from(shortcutButtons || []).find((button) => {
        const shortcut = button.dataset.platformResourceActionShortcut;
        return !button.disabled
          && Boolean(shortcut)
          && matchesResourceActionShortcut(
            event,
            shortcut as PlatformResourceActionShortcut,
          );
      });
      if (!shortcutButton) return;
      event.preventDefault();
      event.stopPropagation();
      shortcutButton.click();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [disabled, onOpenChange, open, ownerId, shortcutActions]);

  useEffect(() => {
    if (disabled && open) onOpenChange(false);
  }, [disabled, onOpenChange, open]);

  return (
    <PlatformPopup
      open={open}
      rootRef={rootRef}
      surfaceRef={surfaceRef}
      rootClassName={joinClassNames("platform-resource-actions-menu", className)}
      surfaceClassName={joinClassNames("platform-resource-actions-menu__popup", popupClassName)}
      surfaceProps={{
        role: "menu",
        "aria-label": actionsLabel,
        "data-platform-resource-actions-owner": ownerId,
        width,
        maxWidth,
      }}
      animation="down-in"
      variant="minimal"
      portal
      placement={placement}
      trigger={({ open: popupOpen }) => (
        <PlatformIconButton
          type="button"
          size="compact"
          active={popupOpen}
          title={actionsLabel}
          aria-label={actionsLabel}
          aria-haspopup="menu"
          aria-expanded={popupOpen}
          disabled={disabled}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onOpenChange(!popupOpen);
          }}
        >
          <Ellipsis width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
        </PlatformIconButton>
      )}
    >
      <PlatformResourceActionsMenuContext.Provider value={{ ownerId }}>
        {children}
      </PlatformResourceActionsMenuContext.Provider>
    </PlatformPopup>
  );
}

export interface PlatformResourceActionsMetadataItem {
  id: string;
  label: ReactNode;
  value: ReactNode;
  title?: string;
  monospace?: boolean;
  copyValue?: string;
  copyAriaLabel?: string;
}

export interface PlatformResourceActionsMetadataProps {
  items: readonly PlatformResourceActionsMetadataItem[];
  className?: string;
}

export interface PlatformResourceActionMenuItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon?: ReactNode;
  label: ReactNode;
  trailing?: ReactNode;
  shortcut?: PlatformResourceActionShortcut;
  active?: boolean;
  danger?: boolean;
}

export function PlatformResourceActionMenuItem({
  icon,
  label,
  trailing,
  shortcut,
  active = false,
  danger = false,
  className = "",
  type = "button",
  ...props
}: PlatformResourceActionMenuItemProps) {
  const shortcutDefinition = shortcut
    ? PLATFORM_RESOURCE_ACTION_SHORTCUTS[shortcut]
    : null;

  return (
    <button
      {...props}
      type={type}
      role="menuitem"
      aria-keyshortcuts={props["aria-keyshortcuts"] || shortcutDefinition?.ariaKeyShortcuts}
      data-platform-resource-action-shortcut={shortcut || undefined}
      className={joinClassNames(
        "tb-popup-row",
        active && "is-selected",
        danger && "is-danger",
        className,
      )}
    >
      {icon ? <span className="tb-popup-icon">{icon}</span> : null}
      <span className="tb-popup-label">{label}</span>
      {shortcutDefinition ? (
        <span className="platform-resource-actions-menu__shortcut" aria-hidden="true">
          {shortcutDefinition.label}
        </span>
      ) : null}
      {trailing ? (
        <span className="platform-resource-actions-menu__item-trailing">{trailing}</span>
      ) : null}
    </button>
  );
}

export interface PlatformResourceActionsInformationProps {
  items: readonly PlatformResourceActionsMetadataItem[];
  resourceLabel: string;
  label?: ReactNode;
  disabled?: boolean;
  className?: string;
  popupClassName?: string;
  width?: number | string;
}

export function PlatformResourceActionsInformation({
  items,
  resourceLabel,
  label = "Information",
  disabled = false,
  className = "",
  popupClassName = "",
  width = 380,
}: PlatformResourceActionsInformationProps) {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const informationId = useId();
  const menuContext = useContext(PlatformResourceActionsMenuContext);
  const normalizedResourceLabel = String(resourceLabel || "Resource").trim() || "Resource";

  const cancelScheduledClose = () => {
    if (closeTimerRef.current === null) return;
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };
  const openInformation = () => {
    cancelScheduledClose();
    if (!disabled) setOpen(true);
  };
  const scheduleClose = () => {
    cancelScheduledClose();
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      setOpen(false);
    }, 120);
  };

  useEffect(() => () => {
    if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
  }, []);
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  return (
    <PlatformPopup
      open={open}
      rootClassName={joinClassNames("platform-resource-actions-information", className)}
      rootProps={{
        onPointerEnter: openInformation,
        onPointerLeave: scheduleClose,
        onFocusCapture: openInformation,
        onBlurCapture: (event) => {
          const nextTarget = event.relatedTarget;
          if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
          scheduleClose();
        },
      }}
      surfaceClassName={joinClassNames(
        "platform-resource-actions-information__popup",
        popupClassName,
      )}
      surfaceProps={{
        id: informationId,
        role: "dialog",
        "aria-label": `${normalizedResourceLabel} information`,
        "data-platform-resource-actions-owner": menuContext?.ownerId,
        width,
        maxWidth: "calc(100vw - 16px)",
        onPointerEnter: cancelScheduledClose,
        onPointerLeave: scheduleClose,
      }}
      animation="left-in"
      variant="minimal"
      portal
      placement="right-start"
      portalOffset={6}
      trigger={
        <PlatformResourceActionMenuItem
          icon={<Info width={14} height={14} strokeWidth={1.8} aria-hidden="true" />}
          label={label}
          trailing={<ChevronRight width={14} height={14} strokeWidth={1.8} aria-hidden="true" />}
          active={open}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? informationId : undefined}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!disabled) setOpen((current) => !current);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              openInformation();
            } else if (event.key === "ArrowLeft") {
              event.preventDefault();
              setOpen(false);
            }
          }}
        />
      }
    >
      <PlatformResourceActionsMetadata
        items={items}
        className="platform-resource-actions-information__metadata"
      />
    </PlatformPopup>
  );
}

export interface PlatformResourceVersionHistoryMenuItemProps
  extends Omit<PlatformResourceActionMenuItemProps, "icon" | "label"> {
  label?: ReactNode;
}

export function PlatformResourceVersionHistoryMenuItem({
  label = "Show version history",
  ...props
}: PlatformResourceVersionHistoryMenuItemProps) {
  return (
    <PlatformResourceActionMenuItem
      {...props}
      icon={
        <HugeiconsIcon
          icon={HistoryIcon}
          width={14}
          height={14}
          strokeWidth={1.8}
          aria-hidden="true"
          data-platform-resource-action-icon="history"
        />
      }
      label={label}
    />
  );
}

export interface PlatformResourceShareMenuItemProps
  extends Omit<PlatformResourceActionMenuItemProps, "icon" | "label"> {
  label?: ReactNode;
}

export function PlatformResourceShareMenuItem({
  label = "Send to Team",
  shortcut = "share",
  ...props
}: PlatformResourceShareMenuItemProps) {
  return (
    <PlatformResourceActionMenuItem
      {...props}
      shortcut={shortcut}
      icon={
        <HugeiconsIcon
          icon={Share01Icon}
          width={14}
          height={14}
          strokeWidth={1.8}
          aria-hidden="true"
          data-platform-resource-action-icon="share"
        />
      }
      label={label}
    />
  );
}

export interface PlatformResourceCopyMenuItemProps
  extends Omit<PlatformResourceActionMenuItemProps, "icon" | "label"> {
  label?: ReactNode;
}

export function PlatformResourceCopyMenuItem({
  label = "Copy Resource",
  ...props
}: PlatformResourceCopyMenuItemProps) {
  return (
    <PlatformResourceActionMenuItem
      {...props}
      icon={
        <HugeiconsIcon
          icon={Copy01Icon}
          width={14}
          height={14}
          strokeWidth={1.8}
          aria-hidden="true"
          data-platform-resource-action-icon="copy"
        />
      }
      label={label}
    />
  );
}

export interface PlatformResourceActionsDividerProps extends HTMLAttributes<HTMLDivElement> {}

export function PlatformResourceActionsDivider({
  className = "",
  ...props
}: PlatformResourceActionsDividerProps) {
  return (
    <div
      {...props}
      className={joinClassNames("platform-resource-actions-menu__divider", className)}
      aria-hidden="true"
    />
  );
}

export function PlatformResourceActionsMetadata({
  items,
  className = "",
}: PlatformResourceActionsMetadataProps) {
  const [copiedItemId, setCopiedItemId] = useState("");
  const copiedStateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (copiedStateTimerRef.current !== null) {
      clearTimeout(copiedStateTimerRef.current);
    }
  }, []);

  const copyItemValue = async (item: PlatformResourceActionsMetadataItem) => {
    if (
      typeof navigator === "undefined"
      || typeof navigator.clipboard?.writeText !== "function"
    ) return;

    try {
      await navigator.clipboard.writeText(item.copyValue || "");
    } catch {
      return;
    }

    if (copiedStateTimerRef.current !== null) {
      clearTimeout(copiedStateTimerRef.current);
    }
    setCopiedItemId(item.id);
    copiedStateTimerRef.current = setTimeout(() => {
      copiedStateTimerRef.current = null;
      setCopiedItemId((currentItemId) => currentItemId === item.id ? "" : currentItemId);
    }, 1600);
  };

  return (
    <div className={joinClassNames("platform-resource-actions-menu__metadata", className)}>
      {items.map((item) => {
        const normalizedItemId = String(item.id || "").trim().toLowerCase();
        const normalizedItemLabel = typeof item.label === "string"
          ? item.label.trim().toLowerCase()
          : "";
        const isResourceIdentifier = normalizedItemId === "id"
          || /(?:^|[-_:])id$/.test(normalizedItemId)
          || normalizedItemLabel === "id"
          || /\bid$/.test(normalizedItemLabel);
        const isCopyable = Boolean(item.copyValue) && !isResourceIdentifier;
        const copyLabel = item.copyAriaLabel || `Copy ${String(item.label || "value")}`;
        const itemWasCopied = copiedItemId === item.id;
        return (
          <div
            key={item.id}
            className={joinClassNames(
              "platform-resource-actions-menu__metadata-row",
              isResourceIdentifier && "is-resource-id",
            )}
          >
            <span className="platform-resource-actions-menu__metadata-label">{item.label}</span>
            <span className="platform-resource-actions-menu__metadata-content">
              <span
                className={joinClassNames(
                  "platform-resource-actions-menu__metadata-value",
                  item.monospace && "is-monospace",
                  isCopyable && "is-copyable",
                )}
                title={item.title}
              >
                {item.value}
              </span>
              {isCopyable ? (
                <PlatformIconButton
                  type="button"
                  size="compact"
                  className={joinClassNames(
                    "platform-resource-actions-menu__metadata-copy",
                    itemWasCopied && "is-copied",
                  )}
                  aria-label={itemWasCopied ? "Copied" : copyLabel}
                  title={itemWasCopied ? "Copied" : copyLabel}
                  onClick={() => void copyItemValue(item)}
                >
                  {itemWasCopied
                    ? <Check width={13} height={13} strokeWidth={1.8} aria-hidden="true" />
                    : <Copy width={13} height={13} strokeWidth={1.8} aria-hidden="true" />}
                </PlatformIconButton>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}

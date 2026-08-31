import { Plug01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Ellipsis, EllipsisVertical } from "../../ui/hugeicons-compat.js";
import {
  type ButtonHTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import { PlatformIconButton } from "../../ui/icon-button/index.js";
import { PlatformPrimaryButton } from "../../ui/button/index.js";
import { PlatformButtonSelector } from "../../ui/selector/index.js";
import {
  PlatformModal,
  PlatformModalBody,
  PlatformModalSplitLayout,
} from "../modal/index.js";
import { PlatformPopup } from "../popup/index.js";

export interface PlatformConnectorPreviewCardProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onClick" | "title"> {
  connectorName: string;
  title: ReactNode;
  description: ReactNode;
  icon: ReactNode;
  backgroundImageSrc?: string;
  activeConnectionCount?: number;
  onOpenSettings: () => void;
  onViewAllConnectors: () => void;
}

export interface PlatformConnectorSettingsItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  onDisconnect?: () => void | Promise<void>;
}

export interface PlatformConnectorSettingsGroup {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  items: readonly PlatformConnectorSettingsItem[];
}

export interface PlatformConnectorSettingsPrimaryAction {
  label: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  popupAriaLabel?: string;
  options?: readonly PlatformConnectorSettingsPrimaryActionOption[];
}

export interface PlatformConnectorSettingsPrimaryActionOption {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  onSelect: () => void;
}

export interface PlatformConnectorSettingsModalProps {
  open: boolean;
  title?: ReactNode;
  ariaLabel?: string;
  groups: readonly PlatformConnectorSettingsGroup[];
  activeItemId?: string;
  onActiveItemChange?: (itemId: string) => void;
  emptyState?: ReactNode;
  primaryAction?: PlatformConnectorSettingsPrimaryAction;
  onClose: () => void;
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

function PlatformConnectorSettingsItemActions({
  item,
  triggerLabel = "Connection actions",
  vertical = false,
  rootClassName = "platform-connector-settings-modal__content-menu-anchor",
}: {
  item: PlatformConnectorSettingsItem;
  triggerLabel?: string;
  vertical?: boolean;
  rootClassName?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const menuAnchorRef = useRef<HTMLDivElement | null>(null);
  const menuSurfaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen || typeof document === "undefined") return undefined;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (menuAnchorRef.current?.contains(target) || menuSurfaceRef.current?.contains(target)) {
        return;
      }
      setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    document.addEventListener("keydown", closeOnEscape, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
      document.removeEventListener("keydown", closeOnEscape, true);
    };
  }, [menuOpen]);

  async function disconnect() {
    if (!item.onDisconnect || disconnecting) return;
    setMenuOpen(false);
    setDisconnecting(true);
    try {
      await item.onDisconnect();
    } catch {
      // The repository surface owns and renders connector-specific errors.
    } finally {
      setDisconnecting(false);
    }
  }

  if (!item.onDisconnect) return null;

  return (
    <PlatformPopup
      open={menuOpen}
      variant="minimal"
      portal
      placement="bottom-end"
      animation="down-in"
      rootRef={menuAnchorRef}
      surfaceRef={menuSurfaceRef}
      rootClassName={rootClassName}
      surfaceClassName="platform-connector-settings-modal__content-menu"
      surfaceProps={{
        role: "menu",
        "aria-label": triggerLabel,
        width: 180,
      }}
      trigger={({ open: popupOpen }) => (
        <PlatformIconButton
          type="button"
          size="compact"
          active={popupOpen}
          aria-label={triggerLabel}
          aria-haspopup="menu"
          aria-expanded={popupOpen}
          disabled={disconnecting}
          onClick={() => setMenuOpen((current) => !current)}
        >
          {vertical ? (
            <EllipsisVertical aria-hidden="true" />
          ) : (
            <Ellipsis aria-hidden="true" />
          )}
        </PlatformIconButton>
      )}
    >
      <button
        type="button"
        role="menuitem"
        className="tb-popup-row"
        disabled={disconnecting}
        onClick={() => void disconnect()}
      >
        <span className="tb-popup-label">Disconnect</span>
      </button>
    </PlatformPopup>
  );
}

function PlatformConnectorSettingsContentHeader({
  item,
}: {
  item: PlatformConnectorSettingsItem;
}) {
  return (
    <div className="platform-connector-settings-modal__content-header">
      <h1 className="platform-connector-settings-modal__content-title">
        {item.label}
      </h1>
      <PlatformConnectorSettingsItemActions item={item} />
    </div>
  );
}

/**
 * Compact entry point for a connector whose full configuration belongs in a
 * dedicated settings workflow. It centralizes both the primary settings action
 * and the secondary connector navigation menu without nesting controls.
 */
export function PlatformConnectorPreviewCard({
  connectorName,
  title,
  description,
  icon,
  backgroundImageSrc,
  activeConnectionCount,
  onOpenSettings,
  onViewAllConnectors,
  className = "",
  type = "button",
  disabled = false,
  ...props
}: PlatformConnectorPreviewCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnchorRef = useRef<HTMLDivElement | null>(null);
  const menuSurfaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen || typeof document === "undefined") return undefined;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (menuAnchorRef.current?.contains(target) || menuSurfaceRef.current?.contains(target)) {
        return;
      }
      setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    document.addEventListener("keydown", closeOnEscape, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
      document.removeEventListener("keydown", closeOnEscape, true);
    };
  }, [menuOpen]);

  function runMenuAction(action: () => void) {
    setMenuOpen(false);
    action();
  }

  return (
    <div
      className={joinClassNames(
        "platform-connector-preview-card",
        disabled && "is-disabled",
        className,
      )}
      data-platform-connector-preview-card="true"
    >
      <button
        {...props}
        type={type}
        className="platform-connector-preview-card__action"
        aria-haspopup={props["aria-haspopup"] ?? "dialog"}
        disabled={disabled}
        onClick={onOpenSettings}
      >
        <span className="platform-connector-preview-card__media" aria-hidden="true">
          {backgroundImageSrc ? (
            <img
              className="platform-connector-preview-card__media-image"
              src={backgroundImageSrc}
              alt=""
              width={768}
              height={512}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          ) : null}
          <span className="platform-connector-preview-card__icon">{icon}</span>
        </span>
        <span className="platform-connector-preview-card__body">
          <span className="platform-connector-preview-card__title-row">
            <strong className="platform-connector-preview-card__title">{title}</strong>
          </span>
          <span className="platform-connector-preview-card__description">{description}</span>
          {typeof activeConnectionCount === "number" ? (
            <span className="platform-connector-preview-card__connections">
              <HugeiconsIcon
                icon={Plug01Icon}
                size={10}
                color="currentColor"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span>
                {Math.max(0, activeConnectionCount)} {Math.max(0, activeConnectionCount) === 1 ? "Connection" : "Connections"}
              </span>
            </span>
          ) : null}
        </span>
      </button>
      <PlatformPopup
        open={menuOpen}
        variant="minimal"
        portal
        placement="bottom-end"
        animation="down-in"
        rootRef={menuAnchorRef}
        surfaceRef={menuSurfaceRef}
        rootClassName="platform-connector-preview-card__menu-anchor"
        surfaceClassName="platform-connector-preview-card__menu"
        surfaceProps={{
          role: "menu",
          "aria-label": `${connectorName} actions`,
          width: 214,
        }}
        trigger={({ open }) => (
          <PlatformIconButton
            type="button"
            size="compact"
            active={open}
            aria-label={`${connectorName} actions`}
            aria-haspopup="menu"
            aria-expanded={open}
            disabled={disabled}
            onClick={() => setMenuOpen((current) => !current)}
          >
            <Ellipsis aria-hidden="true" />
          </PlatformIconButton>
        )}
      >
        <button
          type="button"
          role="menuitem"
          className="tb-popup-row"
          onClick={() => runMenuAction(onOpenSettings)}
        >
          <span className="tb-popup-label">{connectorName} Settings</span>
        </button>
        <button
          type="button"
          role="menuitem"
          className="tb-popup-row"
          onClick={() => runMenuAction(onViewAllConnectors)}
        >
          <span className="tb-popup-label">View all Connectors</span>
        </button>
      </PlatformPopup>
    </div>
  );
}

/**
 * Shared connector management shell. It deliberately mirrors the global
 * Settings modal: provider navigation lives in a persistent left pane and the
 * selected connector owns the scrollable content pane.
 */
export function PlatformConnectorSettingsModal({
  open,
  title = "Connectors",
  ariaLabel = "Connector settings",
  groups,
  activeItemId,
  onActiveItemChange,
  emptyState = null,
  primaryAction,
  onClose,
}: PlatformConnectorSettingsModalProps) {
  const items = groups.flatMap((group) => group.items);
  const activeItem = items.find((item) => item.id === activeItemId)
    || items[0]
    || null;

  return (
    <PlatformModal
      open={open}
      title={title}
      ariaLabel={ariaLabel}
      size="large"
      maxWidth="950px"
      maxHeight="calc(100dvh - 48px)"
      className="platform-connector-settings-modal"
      showHeader={false}
      showFooter={false}
      onClose={onClose}
    >
      <PlatformModalBody className="platform-connector-settings-modal__body">
        <PlatformModalSplitLayout className="platform-connector-settings-modal__layout">
          <aside
            className="platform-modal-sidebar platform-connector-settings-modal__sidebar"
            data-platform-modal-part="sidebar"
            aria-label={`${String(title)} connections`}
          >
            <div
              className="platform-modal-sidebar__body platform-connector-settings-modal__sidebar-body"
              data-platform-modal-pane-part="body"
            >
              <h1 className="platform-connector-settings-modal__sidebar-title">
                {title}
              </h1>
              <nav
                className="platform-connector-settings-modal__navigation"
                aria-label="Connected resources"
              >
                {groups.map((group) => (
                  <section
                    key={group.id}
                    className="platform-connector-settings-modal__group"
                  >
                    <h2 className="platform-connector-settings-modal__group-title">
                      {group.icon ? (
                        <span
                          className="platform-connector-settings-modal__group-icon"
                          aria-hidden="true"
                        >
                          {group.icon}
                        </span>
                      ) : null}
                      <span>{group.label}</span>
                    </h2>
                    {group.items.length > 0 ? (
                      <div className="platform-connector-settings-modal__repository-list">
                        {group.items.map((item) => {
                          const active = item.id === activeItem?.id;
                          return (
                            <div
                              key={item.id}
                              className="platform-connector-settings-modal__repository-item-shell"
                            >
                              <button
                                type="button"
                                className={joinClassNames(
                                  "platform-connector-settings-modal__repository-item",
                                  active && "is-active",
                                  active && item.onDisconnect && "has-actions",
                                )}
                                aria-current={active ? "page" : undefined}
                                onClick={() => onActiveItemChange?.(item.id)}
                              >
                                <span>{item.label}</span>
                              </button>
                              {active && item.onDisconnect ? (
                                <PlatformConnectorSettingsItemActions
                                  item={item}
                                  triggerLabel="Actions for active connection"
                                  vertical
                                  rootClassName="platform-connector-settings-modal__repository-menu-anchor"
                                />
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </section>
                ))}
              </nav>
              {primaryAction ? (
                primaryAction.options?.length ? (
                  <PlatformButtonSelector
                    mode="popup"
                    buttonVariant="primary"
                    buttonSize="small"
                    label={primaryAction.label}
                    popupAriaLabel={primaryAction.popupAriaLabel || String(primaryAction.label)}
                    className="platform-connector-settings-modal__primary-action"
                    disabled={primaryAction.disabled}
                    closeOnSelect
                    matchTriggerWidth
                    fullWidth
                    popupPlacement="top-start"
                  >
                    {primaryAction.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        role="menuitem"
                        className="tb-popup-row"
                        disabled={option.disabled}
                        onClick={option.onSelect}
                      >
                        {option.icon ? (
                          <span className="tb-popup-icon" aria-hidden="true">
                            {option.icon}
                          </span>
                        ) : null}
                        <span className="tb-popup-label">{option.label}</span>
                      </button>
                    ))}
                  </PlatformButtonSelector>
                ) : (
                  <PlatformPrimaryButton
                    type="button"
                    size="small"
                    className="platform-connector-settings-modal__primary-action"
                    disabled={primaryAction.disabled || !primaryAction.onClick}
                    onClick={primaryAction.onClick}
                  >
                    {primaryAction.label}
                  </PlatformPrimaryButton>
                )
              ) : null}
            </div>
          </aside>
          <section
            className="platform-modal-content platform-connector-settings-modal__content"
            data-platform-modal-part="content"
          >
            <div
              className={joinClassNames(
                "platform-modal-content__body",
                "platform-connector-settings-modal__content-body",
                !activeItem && "is-empty",
              )}
              data-platform-modal-pane-part="body"
            >
              {activeItem ? (
                <>
                  <PlatformConnectorSettingsContentHeader
                    key={activeItem.id}
                    item={activeItem}
                  />
                  {activeItem.content}
                </>
              ) : emptyState}
            </div>
          </section>
        </PlatformModalSplitLayout>
      </PlatformModalBody>
    </PlatformModal>
  );
}

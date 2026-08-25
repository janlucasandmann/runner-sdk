import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  type ReactNode,
} from "react";

import { PlatformPopup } from "../../composite/popup/index.js";

export type PlatformTicketItemVariant = "list" | "card";
export type PlatformTicketItemAppearance = "default" | "minimalistic-ui";
export type PlatformTicketType = "task" | "subtask" | "loop";

export interface PlatformTicketItemContextMenuState {
  closeMenu: () => void;
}

export type PlatformTicketItemContextMenu =
  | ReactNode
  | ((state: PlatformTicketItemContextMenuState) => ReactNode);

interface PlatformTicketItemContextMenuProps {
  /** Shared minimal action menu rendered at the pointer location. */
  ticketActionMenu?: PlatformTicketItemContextMenu;
  /** Adds primary-click and keyboard activation to the default right-click trigger. */
  openTicketActionMenuOnClick?: boolean;
  ticketActionMenuAriaLabel?: string;
  onTicketActionMenuOpen?: () => void;
  /** Invoked by Command/Control + Backspace/Delete while this ticket is hovered. */
  onTicketDeleteRequest?: () => void;
  ticketDeleteShortcutDisabled?: boolean;
}

interface PlatformTicketItemBaseProps
  extends PlatformTicketItemContextMenuProps {
  title: ReactNode;
  taskType?: PlatformTicketType;
  typeIcon?: ReactNode;
  priority?: ReactNode;
  ticketNumber?: ReactNode;
  status?: ReactNode;
  assignee?: ReactNode;
  action?: ReactNode;
  completed?: boolean;
  active?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface PlatformTicketListItemProps
  extends
    PlatformTicketItemBaseProps,
    Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> {
  variant?: "list";
  appearance?: PlatformTicketItemAppearance;
  titleEditor?: ReactNode;
}

export interface PlatformTicketCardItemProps
  extends
    Omit<PlatformTicketItemBaseProps, "action">,
    Omit<
      ButtonHTMLAttributes<HTMLButtonElement>,
      "children" | "title" | "disabled"
  > {
  variant: "card";
  createdAt?: string | number | Date | null;
}

export type PlatformTicketItemProps =
  PlatformTicketListItemProps | PlatformTicketCardItemProps;

function joinClassNames(
  ...classNames: Array<string | false | null | undefined>
) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

function getTicketTypeClassName(taskType: PlatformTicketType) {
  return `is-${taskType}`;
}

function formatTicketCreationDate(
  createdAt: string | number | Date | null | undefined,
) {
  if (createdAt === null || createdAt === undefined || createdAt === "") {
    return "";
  }
  const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

interface PlatformTicketItemMenuAnchor {
  x: number;
  y: number;
  focusFirstItem: boolean;
}

const PLATFORM_TICKET_CONTEXT_MENU_POINTER_OFFSET = 10;

function isEditableTicketShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]'),
  );
}

function isTicketDeleteShortcut(event: globalThis.KeyboardEvent) {
  return (event.metaKey || event.ctrlKey)
    && !event.altKey
    && !event.shiftKey
    && (event.key === "Backspace" || event.key === "Delete");
}

function useHoveredTicketDeleteShortcut({
  disabled,
  onDeleteRequest,
}: {
  disabled: boolean;
  onDeleteRequest?: () => void;
}) {
  const deleteRequestRef = useRef(onDeleteRequest);
  deleteRequestRef.current = onDeleteRequest;

  const handleKeyDown = useCallback((event: globalThis.KeyboardEvent) => {
    if (
      disabled
      || event.repeat
      || event.isComposing
      || isEditableTicketShortcutTarget(event.target)
      || !isTicketDeleteShortcut(event)
    ) return;
    event.preventDefault();
    event.stopPropagation();
    deleteRequestRef.current?.();
  }, [disabled]);

  const deactivate = useCallback(() => {
    if (typeof document === "undefined") return;
    document.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  const activate = useCallback(() => {
    if (typeof document === "undefined" || disabled || !deleteRequestRef.current) {
      return;
    }
    document.removeEventListener("keydown", handleKeyDown, true);
    document.addEventListener("keydown", handleKeyDown, true);
  }, [disabled, handleKeyDown]);

  useEffect(() => deactivate, [deactivate]);

  return { activate, deactivate };
}

function usePlatformTicketItemContextMenu(
  contextMenu: PlatformTicketItemContextMenu | undefined,
) {
  const [anchor, setAnchor] = useState<PlatformTicketItemMenuAnchor | null>(
    null,
  );
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const closeMenu = useCallback(() => setAnchor(null), []);
  const openMenuAt = useCallback((
    x: number,
    y: number,
    { focusFirstItem = false }: { focusFirstItem?: boolean } = {},
  ) => {
    setAnchor({
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : 0,
      focusFirstItem,
    });
  }, []);

  useEffect(() => {
    if (!anchor) return undefined;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target instanceof Node ? event.target : null;
      if (target && surfaceRef.current?.contains(target)) return;
      const targetElement = target instanceof Element
        ? target
        : target?.parentElement;
      if (targetElement?.closest("[data-platform-popup-submenu='true']")) return;
      closeMenu();
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    document.addEventListener("mousedown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", closeMenu);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", closeMenu);
    };
  }, [anchor, closeMenu]);

  useEffect(() => {
    if (!anchor?.focusFirstItem) return undefined;
    const focusFrame = window.requestAnimationFrame(() => {
      surfaceRef.current
        ?.querySelector<HTMLElement>("[role='menuitem']:not([disabled])")
        ?.focus();
    });
    return () => window.cancelAnimationFrame(focusFrame);
  }, [anchor]);

  useEffect(() => {
    if (contextMenu === undefined || contextMenu === null) closeMenu();
  }, [closeMenu, contextMenu]);

  const menu = anchor && contextMenu !== undefined && contextMenu !== null
    ? typeof contextMenu === "function"
      ? contextMenu({ closeMenu })
      : contextMenu
    : null;

  return {
    anchor,
    closeMenu,
    menu,
    openMenuAt,
    surfaceRef,
  };
}

function renderPlatformTicketItemContextMenu({
  anchor,
  ariaLabel,
  menu,
  surfaceRef,
  trigger,
}: {
  anchor: PlatformTicketItemMenuAnchor | null;
  ariaLabel: string;
  menu: ReactNode;
  surfaceRef: RefObject<HTMLDivElement | null>;
  trigger: ReactNode;
}) {
  if (!anchor || !menu) return trigger;

  return (
    <PlatformPopup
      open
      portal
      variant="minimal"
      animation="down-in"
      placement="bottom-start"
      portalOffset={0}
      portalCollisionPadding={12}
      portalAnchorPoint={anchor}
      surfaceRef={surfaceRef}
      trigger={trigger}
      rootClassName="platform-ticket-item__context-menu-anchor"
      surfaceClassName="platform-ticket-item__context-menu playground-tasks-backlog-context-menu"
      surfaceProps={{
        role: "menu",
        "aria-label": ariaLabel,
        width: 224,
        maxHeight: "min(360px, calc(100vh - 24px))",
        style: {
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflowY: "auto",
        },
      }}
    >
      {menu}
    </PlatformPopup>
  );
}

function PlatformTicketListItem({
  title,
  titleEditor,
  taskType = "task",
  typeIcon,
  priority,
  ticketNumber,
  status,
  assignee,
  action,
  completed = false,
  active = false,
  disabled = false,
  appearance = "default",
  className = "",
  ticketActionMenu,
  ticketActionMenuAriaLabel = "Ticket actions",
  openTicketActionMenuOnClick = false,
  onTicketActionMenuOpen,
  onTicketDeleteRequest,
  ticketDeleteShortcutDisabled = false,
  onClick,
  onContextMenu,
  onKeyDown,
  onPointerEnter,
  onPointerLeave,
  ...props
}: PlatformTicketListItemProps) {
  const menuState = usePlatformTicketItemContextMenu(ticketActionMenu);
  const deleteShortcut = useHoveredTicketDeleteShortcut({
    disabled: disabled || ticketDeleteShortcutDisabled,
    onDeleteRequest: onTicketDeleteRequest
      ? () => {
          menuState.closeMenu();
          onTicketDeleteRequest();
        }
      : undefined,
  });
  const openMenuFromPointer = (
    event: ReactMouseEvent<HTMLElement>,
    offsetFromPointer = false,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    onTicketActionMenuOpen?.();
    const pointerOffset = offsetFromPointer
      ? PLATFORM_TICKET_CONTEXT_MENU_POINTER_OFFSET
      : 0;
    menuState.openMenuAt(
      event.clientX + pointerOffset,
      event.clientY + pointerOffset,
    );
  };
  const ticketItem = (
    <div
      {...props}
      className={joinClassNames(
        "platform-ticket-item is-list playground-tasks-backlog-item",
        appearance === "minimalistic-ui" && "is-minimalistic-ui",
        active && "is-active",
        disabled && "is-disabled",
        className,
      )}
      data-platform-ticket-item="true"
      data-platform-ticket-item-variant="list"
      data-platform-ticket-item-appearance={appearance}
      aria-disabled={props["aria-disabled"] ?? (disabled || undefined)}
      onPointerEnter={(event) => {
        deleteShortcut.activate();
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        deleteShortcut.deactivate();
        onPointerLeave?.(event);
      }}
      onClick={(event) => {
        if (ticketActionMenu !== undefined && ticketActionMenu !== null && openTicketActionMenuOnClick) {
          openMenuFromPointer(event);
          return;
        }
        onClick?.(event);
      }}
      onContextMenu={(event) => {
        onContextMenu?.(event);
        if (ticketActionMenu !== undefined && ticketActionMenu !== null) {
          openMenuFromPointer(event, true);
        }
      }}
      onKeyDown={(event) => {
        if (
          ticketActionMenu !== undefined
          && ticketActionMenu !== null
          && openTicketActionMenuOnClick
          && (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          event.stopPropagation();
          const rect = event.currentTarget.getBoundingClientRect();
          onTicketActionMenuOpen?.();
          menuState.openMenuAt(rect.left + 16, rect.bottom, {
            focusFirstItem: true,
          });
          return;
        }
        onKeyDown?.(event);
      }}
    >
      <div className="platform-ticket-item__content playground-tasks-backlog-item-content">
        <div className="platform-ticket-item__leading playground-tasks-backlog-leading">
          {typeIcon ? (
            <div
              className={joinClassNames(
                "platform-ticket-item__type playground-tasks-backlog-project-icon",
                getTicketTypeClassName(taskType),
              )}
              aria-hidden="true"
            >
              {typeIcon}
            </div>
          ) : null}
          <div className="platform-ticket-item__main playground-tasks-backlog-main">
            {priority}
            {ticketNumber !== undefined && ticketNumber !== null ? (
              <span className="platform-ticket-item__number playground-tasks-backlog-ticket">
                {ticketNumber}
              </span>
            ) : null}
            {titleEditor || (
              <span
                className={joinClassNames(
                  "platform-ticket-item__title playground-tasks-backlog-title",
                  completed && "is-complete",
                )}
              >
                {title}
              </span>
            )}
          </div>
        </div>
        {status || assignee ? (
          <div className="platform-ticket-item__meta playground-tasks-backlog-meta">
            {status}
            {assignee ? (
              <div className="platform-ticket-item__assignee playground-tasks-backlog-assignee-shell">
                {assignee}
              </div>
            ) : null}
          </div>
        ) : null}
        {action}
      </div>
    </div>
  );
  return renderPlatformTicketItemContextMenu({
    anchor: menuState.anchor,
    ariaLabel: ticketActionMenuAriaLabel,
    menu: menuState.menu,
    surfaceRef: menuState.surfaceRef,
    trigger: ticketItem,
  });
}

function PlatformTicketCardItem({
  title,
  createdAt,
  taskType = "task",
  typeIcon,
  priority,
  ticketNumber,
  status,
  assignee,
  completed = false,
  active = false,
  disabled = false,
  className = "",
  type = "button",
  ticketActionMenu,
  ticketActionMenuAriaLabel = "Ticket actions",
  openTicketActionMenuOnClick = false,
  onTicketActionMenuOpen,
  onTicketDeleteRequest,
  ticketDeleteShortcutDisabled = false,
  onClick,
  onContextMenu,
  onPointerEnter,
  onPointerLeave,
  ...props
}: PlatformTicketCardItemProps) {
  const creationDateLabel = formatTicketCreationDate(createdAt);
  const menuState = usePlatformTicketItemContextMenu(ticketActionMenu);
  const deleteShortcut = useHoveredTicketDeleteShortcut({
    disabled: disabled || ticketDeleteShortcutDisabled,
    onDeleteRequest: onTicketDeleteRequest
      ? () => {
          menuState.closeMenu();
          onTicketDeleteRequest();
        }
      : undefined,
  });
  const ticketItem = (
    <button
      {...props}
      type={type}
      disabled={disabled}
      className={joinClassNames(
        "platform-ticket-item is-card playground-tasks-lane-card",
        active && "is-active",
        className,
      )}
      data-platform-ticket-item="true"
      data-platform-ticket-item-variant="card"
      onPointerEnter={(event) => {
        deleteShortcut.activate();
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        deleteShortcut.deactivate();
        onPointerLeave?.(event);
      }}
      onClick={(event) => {
        if (ticketActionMenu !== undefined && ticketActionMenu !== null && openTicketActionMenuOnClick) {
          event.preventDefault();
          event.stopPropagation();
          onTicketActionMenuOpen?.();
          menuState.openMenuAt(event.clientX, event.clientY);
          return;
        }
        onClick?.(event);
      }}
      onContextMenu={(event) => {
        onContextMenu?.(event);
        if (ticketActionMenu === undefined || ticketActionMenu === null) return;
        event.preventDefault();
        event.stopPropagation();
        onTicketActionMenuOpen?.();
        menuState.openMenuAt(
          event.clientX + PLATFORM_TICKET_CONTEXT_MENU_POINTER_OFFSET,
          event.clientY + PLATFORM_TICKET_CONTEXT_MENU_POINTER_OFFSET,
        );
      }}
    >
      <div className="platform-ticket-item__card-header playground-tasks-lane-card-header">
        <div className="platform-ticket-item__card-header-leading">
          {typeIcon ? (
            <div
              className={joinClassNames(
                "platform-ticket-item__card-type playground-tasks-lane-card-type-badge",
                getTicketTypeClassName(taskType),
              )}
              aria-hidden="true"
            >
              {typeIcon}
            </div>
          ) : null}
          {ticketNumber !== undefined && ticketNumber !== null ? (
            <span className="platform-ticket-item__card-number playground-tasks-lane-card-ticket">
              {ticketNumber}
            </span>
          ) : null}
        </div>
        {assignee}
      </div>
      <div className="platform-ticket-item__card-summary playground-tasks-lane-card-summary">
        {status ? (
          <span className="platform-ticket-item__card-status playground-tasks-lane-card-status">
            {status}
          </span>
        ) : null}
        <div
          className={joinClassNames(
            "platform-ticket-item__card-title playground-tasks-lane-card-title",
            completed && "is-complete",
          )}
        >
          {title}
        </div>
      </div>
      <div className="platform-ticket-item__card-footer playground-tasks-lane-card-bottom">
        <div className="platform-ticket-item__card-meta playground-tasks-lane-card-meta-left">
          {priority}
          {creationDateLabel ? (
            <time
              className="platform-ticket-item__card-created-at playground-tasks-lane-card-created-at"
              dateTime={
                createdAt instanceof Date
                  ? createdAt.toISOString()
                  : String(createdAt)
              }
            >
              {creationDateLabel}
            </time>
          ) : null}
        </div>
      </div>
    </button>
  );
  return renderPlatformTicketItemContextMenu({
    anchor: menuState.anchor,
    ariaLabel: ticketActionMenuAriaLabel,
    menu: menuState.menu,
    surfaceRef: menuState.surfaceRef,
    trigger: ticketItem,
  });
}

export function PlatformTicketItem(props: PlatformTicketItemProps) {
  if (props.variant === "card") {
    return <PlatformTicketCardItem {...props} />;
  }
  return <PlatformTicketListItem {...props} />;
}

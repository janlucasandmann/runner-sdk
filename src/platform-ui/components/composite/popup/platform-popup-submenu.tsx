import { ChevronRight } from "../../ui/hugeicons-compat.js";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

import { PlatformPopup } from "./platform-popup.js";

export interface PlatformPopupSubmenuProps {
  label: ReactNode;
  children: ReactNode;
  popupAriaLabel: string;
  leading?: ReactNode;
  detail?: ReactNode;
  disabled?: boolean;
  popupWidth?: CSSProperties["width"];
  popupMaxWidth?: CSSProperties["maxWidth"];
  popupMaxHeight?: CSSProperties["maxHeight"];
  hoverCloseDelayMs?: number;
  closeOnSelect?: boolean;
  className?: string;
  triggerClassName?: string;
  popupClassName?: string;
  onOpenChange?: (open: boolean) => void;
}

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

/**
 * A reusable menu row whose secondary minimal popup opens beside its parent.
 * Hover intent is shared by the trigger and the portaled surface, so users can
 * move between them without the submenu flickering closed.
 */
export function PlatformPopupSubmenu({
  label,
  children,
  popupAriaLabel,
  leading,
  detail,
  disabled = false,
  popupWidth = 184,
  popupMaxWidth = "calc(100vw - 24px)",
  popupMaxHeight = "min(320px, calc(100vh - 24px))",
  hoverCloseDelayMs = 120,
  closeOnSelect = false,
  className = "",
  triggerClassName = "",
  popupClassName = "",
  onOpenChange,
}: PlatformPopupSubmenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearScheduledClose = useCallback(() => {
    if (closeTimerRef.current === null) return;
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }, []);

  const commitOpen = useCallback(
    (nextOpen: boolean) => {
      if (disabled && nextOpen) return;
      setOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [disabled, onOpenChange],
  );

  const openSubmenu = useCallback(() => {
    clearScheduledClose();
    commitOpen(true);
  }, [clearScheduledClose, commitOpen]);

  const scheduleClose = useCallback(() => {
    clearScheduledClose();
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      commitOpen(false);
    }, Math.max(0, hoverCloseDelayMs));
  }, [clearScheduledClose, commitOpen, hoverCloseDelayMs]);

  useEffect(() => {
    if (!disabled || !open) return;
    commitOpen(false);
  }, [commitOpen, disabled, open]);

  useEffect(
    () => () => {
      clearScheduledClose();
    },
    [clearScheduledClose],
  );

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openSubmenu();
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "Escape") {
      event.preventDefault();
      commitOpen(false);
    }
  };

  const handleSurfaceKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "Escape") return;
    event.preventDefault();
    commitOpen(false);
    triggerRef.current?.focus();
  };

  const handleSurfaceClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!closeOnSelect) return;
    const target = event.target instanceof Element ? event.target : null;
    if (
      target?.closest(
        "button:not([disabled]), a[href], [role='menuitem']:not([aria-disabled='true']), [role='option']:not([aria-disabled='true'])",
      )
    ) {
      commitOpen(false);
    }
  };

  return (
    <PlatformPopup
      open={open}
      portal
      variant="minimal"
      animation="left-in"
      placement="right-start"
      portalOffset={4}
      portalCollisionPadding={12}
      rootRef={rootRef}
      surfaceRef={surfaceRef}
      rootClassName={joinClassNames("platform-popup-submenu", className)}
      surfaceClassName={joinClassNames(
        "platform-popup-submenu__surface",
        popupClassName,
      )}
      rootProps={{
        onPointerEnter: openSubmenu,
        onPointerLeave: scheduleClose,
        onFocusCapture: openSubmenu,
        onBlurCapture: scheduleClose,
      }}
      surfaceProps={{
        role: "menu",
        "aria-label": popupAriaLabel,
        "data-platform-popup-submenu": "true",
        width: popupWidth,
        maxWidth: popupMaxWidth,
        maxHeight: popupMaxHeight,
        style: { minWidth: 0, overflowY: "auto" },
        onPointerEnter: openSubmenu,
        onPointerLeave: scheduleClose,
        onFocusCapture: openSubmenu,
        onBlurCapture: scheduleClose,
        onKeyDown: handleSurfaceKeyDown,
        onClick: handleSurfaceClick,
      }}
      trigger={
        <button
          ref={triggerRef}
          type="button"
          role="menuitem"
          className={joinClassNames(
            "tb-popup-row",
            "platform-popup-submenu__trigger",
            open && "is-selected",
            triggerClassName,
          )}
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            commitOpen(!open);
          }}
          onKeyDown={handleTriggerKeyDown}
        >
          {leading ? (
            <span className="platform-popup-submenu__leading" aria-hidden="true">
              {leading}
            </span>
          ) : null}
          <span className="platform-popup-submenu__label">{label}</span>
          {detail ? (
            <span className="platform-popup-submenu__detail">{detail}</span>
          ) : null}
          <ChevronRight
            className="platform-popup-submenu__chevron"
            width={14}
            height={14}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </button>
      }
    >
      {children}
    </PlatformPopup>
  );
}

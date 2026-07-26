import { ChevronDown } from "lucide-react";
import {
  type AriaRole,
  type CSSProperties,
  forwardRef,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  PlatformPopup,
  type PlatformPopupVariant,
} from "../../composite/popup/index.js";
import {
  PlatformButton,
  type PlatformButtonSize,
  type PlatformButtonVariant,
} from "../button/index.js";
import type { PlatformSelectorPopupAlignment } from "./platform-selector.js";

export type PlatformButtonSelectorMode = "popup" | "split-action";

export interface PlatformButtonSelectorProps {
  label: ReactNode;
  children: ReactNode;
  popupAriaLabel: string;
  mode?: PlatformButtonSelectorMode;
  buttonVariant?: PlatformButtonVariant;
  buttonSize?: PlatformButtonSize;
  leading?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAction?: () => void | Promise<void>;
  actionAriaLabel?: string;
  disabled?: boolean;
  actionDisabled?: boolean;
  popupDisabled?: boolean;
  active?: boolean;
  closeOnAction?: boolean;
  closeOnSelect?: boolean;
  openOnHover?: boolean;
  hoverCloseDelayMs?: number;
  popupAlignment?: PlatformSelectorPopupAlignment;
  popupRole?: AriaRole;
  popupVariant?: PlatformPopupVariant;
  popupWidth?: CSSProperties["width"];
  popupMaxWidth?: CSSProperties["maxWidth"];
  popupMaxHeight?: CSSProperties["maxHeight"];
  matchTriggerWidth?: boolean;
  fullWidth?: boolean;
  className?: string;
  buttonClassName?: string;
  actionButtonClassName?: string;
  popupButtonClassName?: string;
  popupClassName?: string;
  rootRef?: Ref<HTMLDivElement>;
}

function joinPlatformButtonSelectorClassNames(
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

function assignPlatformButtonSelectorRef<T>(
  ref: Ref<T> | undefined,
  value: T | null,
) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

export const PlatformButtonSelector = forwardRef<
  HTMLDivElement,
  PlatformButtonSelectorProps
>(function PlatformButtonSelector(
  {
    label,
    children,
    popupAriaLabel,
    mode = "popup",
    buttonVariant = "secondary",
    buttonSize = "small",
    leading,
    open,
    defaultOpen = false,
    onOpenChange,
    onAction,
    actionAriaLabel,
    disabled = false,
    actionDisabled = disabled,
    popupDisabled = disabled,
    active = false,
    closeOnAction = true,
    closeOnSelect = false,
    openOnHover = false,
    hoverCloseDelayMs = 120,
    popupAlignment = "left",
    popupRole = "menu",
    popupVariant = "minimal",
    popupWidth,
    popupMaxWidth,
    popupMaxHeight = "min(320px, calc(100vh - 32px))",
    matchTriggerWidth = false,
    fullWidth = false,
    className = "",
    buttonClassName = "",
    actionButtonClassName = "",
    popupButtonClassName = "",
    popupClassName = "",
    rootRef,
  },
  forwardedRef,
) {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const primaryPopupTriggerRef = useRef<HTMLButtonElement | null>(null);
  const chevronPopupTriggerRef = useRef<HTMLButtonElement | null>(null);
  const lastPopupTriggerRef = useRef<HTMLButtonElement | null>(null);
  const hoverCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const controlled = open !== undefined;
  const resolvedOpen = controlled ? Boolean(open) : internalOpen;
  const resolvedActionDisabled =
    actionDisabled || (mode === "split-action" && !onAction);
  const selectorDisabled =
    mode === "popup" ? popupDisabled : resolvedActionDisabled && popupDisabled;

  const commitOpen = useCallback(
    (nextOpen: boolean) => {
      if (popupDisabled && nextOpen) return;
      if (!controlled) setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [controlled, onOpenChange, popupDisabled],
  );

  const setAnchorRef = useCallback(
    (element: HTMLDivElement | null) => {
      anchorRef.current = element;
      assignPlatformButtonSelectorRef(rootRef, element);
      assignPlatformButtonSelectorRef(forwardedRef, element);
    },
    [forwardedRef, rootRef],
  );

  const clearHoverCloseTimer = useCallback(() => {
    if (hoverCloseTimerRef.current === null) return;
    clearTimeout(hoverCloseTimerRef.current);
    hoverCloseTimerRef.current = null;
  }, []);

  const handleHoverEnter = () => {
    if (!openOnHover) return;
    clearHoverCloseTimer();
    commitOpen(true);
  };

  const handleHoverLeave = () => {
    if (!openOnHover) return;
    clearHoverCloseTimer();
    hoverCloseTimerRef.current = setTimeout(
      () => {
        hoverCloseTimerRef.current = null;
        commitOpen(false);
      },
      Math.max(0, hoverCloseDelayMs),
    );
  };

  const togglePopup = (trigger?: HTMLButtonElement | null) => {
    if (popupDisabled) return;
    if (trigger) lastPopupTriggerRef.current = trigger;
    commitOpen(!resolvedOpen);
  };

  const handlePopupTriggerKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    lastPopupTriggerRef.current = event.currentTarget;
    commitOpen(true);
  };

  const handleAction = () => {
    if (resolvedActionDisabled || !onAction) return;
    if (closeOnAction) commitOpen(false);
    void onAction();
  };

  const handlePopupContentClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!closeOnSelect) return;

    const target = event.target instanceof Element ? event.target : null;
    const selectableTarget = target?.closest(
      "button:not([disabled]), a[href], [role='menuitem']:not([aria-disabled='true']), [role='option']:not([aria-disabled='true'])",
    );
    if (selectableTarget) {
      commitOpen(false);
    }
  };

  useEffect(() => {
    if (!resolvedOpen) return undefined;

    function handlePointerDown(event: globalThis.MouseEvent) {
      const target = event.target instanceof Node ? event.target : null;
      if (
        !target ||
        anchorRef.current?.contains(target) ||
        popupRef.current?.contains(target)
      )
        return;
      commitOpen(false);
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      commitOpen(false);
      (
        lastPopupTriggerRef.current ||
        primaryPopupTriggerRef.current ||
        chevronPopupTriggerRef.current
      )?.focus();
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [commitOpen, resolvedOpen]);

  useEffect(() => {
    if (popupDisabled && resolvedOpen) commitOpen(false);
  }, [commitOpen, popupDisabled, resolvedOpen]);

  useEffect(
    () => () => {
      clearHoverCloseTimer();
    },
    [clearHoverCloseTimer],
  );

  const sharedButtonContent = (
    <>
      {leading ? (
        <span className="platform-button-selector__leading" aria-hidden="true">
          {leading}
        </span>
      ) : null}
      <span className="platform-button-selector__label">{label}</span>
    </>
  );
  const popupAriaHasPopup = popupRole === "listbox" ? "listbox" : "menu";
  const mainButtonIsPopupTrigger = mode === "popup";
  const trigger = (
    <div
      className={joinPlatformButtonSelectorClassNames(
        "platform-button-selector__group",
        `is-${buttonVariant}`,
      )}
    >
      <PlatformButton
        ref={mainButtonIsPopupTrigger ? primaryPopupTriggerRef : undefined}
        variant={buttonVariant}
        size={buttonSize}
        type="button"
        className={joinPlatformButtonSelectorClassNames(
          "platform-button-selector__action",
          mainButtonIsPopupTrigger && "platform-button-selector__button",
          mainButtonIsPopupTrigger ? buttonClassName : actionButtonClassName,
        )}
        active={mainButtonIsPopupTrigger && (active || resolvedOpen)}
        title={mainButtonIsPopupTrigger ? popupAriaLabel : actionAriaLabel}
        aria-label={mainButtonIsPopupTrigger ? popupAriaLabel : actionAriaLabel}
        aria-haspopup={mainButtonIsPopupTrigger ? popupAriaHasPopup : undefined}
        aria-expanded={mainButtonIsPopupTrigger ? resolvedOpen : undefined}
        disabled={
          mainButtonIsPopupTrigger ? popupDisabled : resolvedActionDisabled
        }
        onClick={
          mainButtonIsPopupTrigger
            ? (event) => togglePopup(event.currentTarget)
            : handleAction
        }
        onKeyDown={
          mainButtonIsPopupTrigger ? handlePopupTriggerKeyDown : undefined
        }
      >
        {sharedButtonContent}
      </PlatformButton>
      <span className="platform-button-selector__divider" aria-hidden="true" />
      <PlatformButton
        ref={chevronPopupTriggerRef}
        variant={buttonVariant}
        size={buttonSize}
        type="button"
        className={joinPlatformButtonSelectorClassNames(
          "platform-button-selector__popup-trigger",
          popupButtonClassName,
        )}
        active={active || resolvedOpen}
        title={popupAriaLabel}
        aria-label={
          mainButtonIsPopupTrigger
            ? `${popupAriaLabel} options`
            : popupAriaLabel
        }
        aria-haspopup={popupAriaHasPopup}
        aria-expanded={resolvedOpen}
        disabled={popupDisabled}
        onClick={(event) => {
          event.stopPropagation();
          togglePopup(event.currentTarget);
        }}
        onKeyDown={handlePopupTriggerKeyDown}
      >
        <ChevronDown aria-hidden="true" />
      </PlatformButton>
    </div>
  );

  return (
    <PlatformPopup
      open={resolvedOpen}
      rootRef={setAnchorRef}
      rootClassName={joinPlatformButtonSelectorClassNames(
        "platform-button-selector",
        `is-mode-${mode}`,
        `is-${buttonVariant}`,
        fullWidth && "is-full-width",
        selectorDisabled && "is-disabled",
        className,
      )}
      surfaceRef={popupRef}
      surfaceClassName={joinPlatformButtonSelectorClassNames(
        "platform-selector__popup",
        "platform-button-selector__popup",
        popupClassName,
      )}
      surfaceProps={{
        role: popupRole,
        "aria-label": popupAriaLabel,
        width: popupWidth,
        maxWidth: popupMaxWidth,
        maxHeight: popupMaxHeight,
        onClick: handlePopupContentClick,
        onMouseEnter: handleHoverEnter,
        onMouseLeave: handleHoverLeave,
      }}
      rootProps={{
        onMouseEnter: handleHoverEnter,
        onMouseLeave: handleHoverLeave,
      }}
      animation="down-in"
      variant={popupVariant}
      portal
      placement={popupAlignment === "right" ? "bottom-end" : "bottom-start"}
      portalMatchAnchorWidth={matchTriggerWidth}
      trigger={trigger}
    >
      {children}
    </PlatformPopup>
  );
});

import {
  createElement,
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export type PlatformModalVariant = "small" | "medium" | "large";
export type PlatformModalSize = PlatformModalVariant | "compact" | "wide" | "full";
export type PlatformModalCloseReason = "backdrop" | "escape" | "close-button";

export interface PlatformModalSurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: PlatformModalSize;
  visible?: boolean;
  closing?: boolean;
  width?: CSSProperties["width"];
  maxWidth?: CSSProperties["maxWidth"];
  maxHeight?: CSSProperties["maxHeight"];
  scrollable?: boolean;
}

export interface PlatformModalBackdropProps extends HTMLAttributes<HTMLDivElement> {
  visible?: boolean;
  closing?: boolean;
}

export interface PlatformModalProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  onClose: (reason: PlatformModalCloseReason) => void;
  onExited?: () => void;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  portal?: boolean;
  portalTarget?: Element | DocumentFragment | null;
  lockScroll?: boolean;
  restoreFocus?: boolean;
  trapFocus?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  as?: ElementType;
  size?: PlatformModalSize;
  width?: CSSProperties["width"];
  maxWidth?: CSSProperties["maxWidth"];
  maxHeight?: CSSProperties["maxHeight"];
  scrollable?: boolean;
  visible?: boolean;
  closing?: boolean;
  animationDurationMs?: number;
  className?: string;
  backdropClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  closeButtonClassName?: string;
  closeButtonLabel?: string;
  closeButtonDisabled?: boolean;
  surfaceRef?: Ref<HTMLElement>;
  backdropRef?: Ref<HTMLDivElement>;
  surfaceProps?: Omit<PlatformModalSurfaceProps, "as" | "children" | "className" | "size" | "visible" | "closing">;
  backdropProps?: Omit<PlatformModalBackdropProps, "children" | "className" | "visible" | "closing">;
  role?: "dialog" | "alertdialog";
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

export interface PlatformModalHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "onClose"> {
  title?: ReactNode;
  description?: ReactNode;
  titleId?: string;
  descriptionId?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  onClose?: () => void;
  closeButtonClassName?: string;
  closeButtonLabel?: string;
  closeButtonDisabled?: boolean;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

let modalScrollLockCount = 0;
let modalPreviousBodyOverflow = "";

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

function lockDocumentScroll() {
  if (typeof document === "undefined") return;
  if (modalScrollLockCount === 0) {
    modalPreviousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  modalScrollLockCount += 1;
}

function unlockDocumentScroll() {
  if (typeof document === "undefined" || modalScrollLockCount === 0) return;
  modalScrollLockCount -= 1;
  if (modalScrollLockCount === 0) {
    document.body.style.overflow = modalPreviousBodyOverflow;
    modalPreviousBodyOverflow = "";
  }
}

function getFocusableElements(surface: HTMLElement | null) {
  if (!surface) return [];
  return Array.from(surface.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => (
    !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
  ));
}

export const PlatformModalBackdrop = forwardRef<HTMLDivElement, PlatformModalBackdropProps>(
  function PlatformModalBackdrop({ visible, closing, className = "", children, ...props }, ref) {
    const resolvedClosing = closing ?? className.split(/\s+/).includes("is-closing");
    const resolvedVisible = visible ?? !resolvedClosing;
    return (
      <div
        {...props}
        ref={ref}
        className={joinClassNames(
          "platform-modal-backdrop",
          "playground-platform-modal-backdrop",
          resolvedVisible && "is-visible",
          resolvedClosing && "is-closing",
          className
        )}
        data-platform-modal-state={resolvedClosing ? "closing" : resolvedVisible ? "visible" : "opening"}
      >
        {children}
      </div>
    );
  }
);

export const PlatformModalSurface = forwardRef<HTMLElement, PlatformModalSurfaceProps>(
  function PlatformModalSurface({
    as = "div",
    size = "medium",
    visible,
    closing,
    width,
    maxWidth,
    maxHeight,
    scrollable = false,
    className = "",
    children,
    style,
    ...props
  }, ref) {
    const resolvedClosing = closing ?? className.split(/\s+/).includes("is-closing");
    const resolvedVisible = visible ?? !resolvedClosing;
    return createElement(as, {
      ...props,
      ref,
      className: joinClassNames(
        "platform-modal-surface",
        "playground-platform-modal",
        `is-size-${size}`,
        resolvedVisible && "is-visible",
        resolvedClosing && "is-closing",
        scrollable && "is-scrollable",
        className
      ),
      "data-platform-modal-state": resolvedClosing ? "closing" : resolvedVisible ? "visible" : "opening",
      style: {
        ...style,
        width: width ?? style?.width,
        maxWidth: maxWidth ?? style?.maxWidth,
        maxHeight: maxHeight ?? style?.maxHeight,
      },
    }, children);
  }
);

export function PlatformModal({
  open,
  title,
  description,
  children,
  onClose,
  onExited,
  closeOnBackdrop = true,
  closeOnEscape = true,
  portal = true,
  portalTarget,
  lockScroll = true,
  restoreFocus = true,
  trapFocus = true,
  initialFocusRef,
  as = "div",
  size = "medium",
  width,
  maxWidth,
  maxHeight,
  scrollable = false,
  visible: controlledVisible,
  closing = false,
  animationDurationMs = 75,
  className = "",
  backdropClassName = "",
  headerClassName = "",
  titleClassName = "",
  descriptionClassName = "",
  closeButtonClassName = "",
  closeButtonLabel = "Close modal",
  closeButtonDisabled = false,
  surfaceRef,
  backdropRef,
  surfaceProps = {},
  backdropProps = {},
  role = "dialog",
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
}: PlatformModalProps) {
  const generatedId = useId().replace(/:/g, "");
  const [present, setPresent] = useState(open);
  const [automaticVisible, setAutomaticVisible] = useState(false);
  const localSurfaceRef = useRef<HTMLElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const resolvedVisible = controlledVisible ?? automaticVisible;
  const resolvedClosing = closing || (!open && present);
  const titleId = ariaLabelledBy || `platform-modal-title-${generatedId}`;
  const descriptionId = ariaDescribedBy || `platform-modal-description-${generatedId}`;

  useEffect(() => {
    if (open) {
      setPresent(true);
      const frame = requestAnimationFrame(() => setAutomaticVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    setAutomaticVisible(false);
    if (!present) return;
    const timer = window.setTimeout(() => {
      setPresent(false);
      onExited?.();
    }, Math.max(0, animationDurationMs));
    return () => window.clearTimeout(timer);
  }, [animationDurationMs, onExited, open, present]);

  useEffect(() => {
    if (!present || !lockScroll) return;
    lockDocumentScroll();
    return unlockDocumentScroll;
  }, [lockScroll, present]);

  useEffect(() => {
    if (!present || !resolvedVisible || typeof document === "undefined") return;
    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = requestAnimationFrame(() => {
      const surface = localSurfaceRef.current;
      const preferred = initialFocusRef?.current;
      const target = preferred && surface?.contains(preferred)
        ? preferred
        : getFocusableElements(surface)[0] || surface;
      target?.focus({ preventScroll: true });
    });
    return () => {
      cancelAnimationFrame(frame);
      if (restoreFocus) previouslyFocusedRef.current?.focus({ preventScroll: true });
    };
  }, [initialFocusRef, present, resolvedVisible, restoreFocus]);

  useEffect(() => {
    if (!present || typeof document === "undefined") return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape && typeof onClose === "function") {
        event.preventDefault();
        event.stopPropagation();
        onClose("escape");
        return;
      }
      if (event.key !== "Tab" || !trapFocus) return;
      const surface = localSurfaceRef.current;
      if (!surface || !surface.contains(event.target as Node)) return;
      const focusable = getFocusableElements(surface);
      if (focusable.length === 0) {
        event.preventDefault();
        surface.focus({ preventScroll: true });
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [closeOnEscape, onClose, present, trapFocus]);

  if (!present) return null;

  const {
    onClick: surfaceOnClick,
    tabIndex: surfaceTabIndex,
    ...restSurfaceProps
  } = surfaceProps;
  const {
    onClick: backdropOnClick,
    ...restBackdropProps
  } = backdropProps;
  const modal = (
    <PlatformModalBackdrop
      {...restBackdropProps}
      ref={(element) => assignRef(backdropRef, element)}
      className={backdropClassName}
      visible={resolvedVisible}
      closing={resolvedClosing}
      onClick={(event) => {
        backdropOnClick?.(event);
        if (
          !event.defaultPrevented
          && event.target === event.currentTarget
          && closeOnBackdrop
          && typeof onClose === "function"
        ) {
          onClose("backdrop");
        }
      }}
    >
      <PlatformModalSurface
        {...restSurfaceProps}
        ref={(element) => {
          localSurfaceRef.current = element;
          assignRef(surfaceRef, element);
        }}
        as={as}
        size={size}
        visible={resolvedVisible}
        closing={resolvedClosing}
        width={width}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        scrollable={scrollable}
        className={className}
        role={role}
        aria-modal="true"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : titleId}
        aria-describedby={description != null ? descriptionId : ariaDescribedBy}
        tabIndex={surfaceTabIndex ?? -1}
        onClick={(event) => {
          event.stopPropagation();
          surfaceOnClick?.(event);
        }}
      >
        {title != null ? (
          <PlatformModalHeader
            className={headerClassName}
            title={title}
            description={description}
            titleId={titleId}
            descriptionId={descriptionId}
            titleClassName={titleClassName}
            descriptionClassName={descriptionClassName}
            onClose={typeof onClose === "function" ? () => onClose("close-button") : undefined}
            closeButtonClassName={closeButtonClassName}
            closeButtonLabel={closeButtonLabel}
            closeButtonDisabled={closeButtonDisabled}
          />
        ) : null}
        {children}
      </PlatformModalSurface>
    </PlatformModalBackdrop>
  );

  const target = portalTarget ?? (typeof document !== "undefined" ? document.body : null);
  return portal && target ? createPortal(modal, target) : modal;
}

export function PlatformModalHeader({
  title,
  description,
  titleId,
  descriptionId,
  titleClassName = "",
  descriptionClassName = "",
  onClose,
  closeButtonClassName = "",
  closeButtonLabel = "Close modal",
  closeButtonDisabled = false,
  className = "",
  children,
  ...props
}: PlatformModalHeaderProps) {
  if (title == null) {
    return (
      <div {...props} className={joinClassNames("platform-modal-header", className)}>
        {children}
      </div>
    );
  }
  return (
    <div {...props} className={joinClassNames("platform-modal-header", className)}>
      <div className="platform-modal-header__copy">
        <h2
          id={titleId}
          className={joinClassNames("platform-modal-header__title", titleClassName)}
        >
          {title}
        </h2>
        {description != null ? (
          <p
            id={descriptionId}
            className={joinClassNames("platform-modal-header__description", descriptionClassName)}
          >
            {description}
          </p>
        ) : null}
      </div>
      {onClose ? (
        <button
          type="button"
          className={joinClassNames("platform-modal-header__close", closeButtonClassName)}
          aria-label={closeButtonLabel}
          onClick={onClose}
          disabled={closeButtonDisabled}
        >
          <X width={16} height={16} strokeWidth={2} aria-hidden="true" />
        </button>
      ) : null}
      {children}
    </div>
  );
}

export function PlatformModalBody({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={joinClassNames("platform-modal-body", className)} />;
}

export function PlatformModalFooter({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={joinClassNames("platform-modal-footer", className)} />;
}

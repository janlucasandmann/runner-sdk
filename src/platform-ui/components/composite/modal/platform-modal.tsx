import {
  Children,
  Fragment,
  createElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
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
import {
  PlatformSearch,
  type PlatformSearchProps,
} from "../../ui/search/platform-search.js";
import { useModalResizeTransition } from "./use-modal-resize-transition.js";

export type PlatformModalVariant = "small" | "medium" | "large";
export type PlatformModalSize = PlatformModalVariant | "compact" | "wide" | "full";
export type PlatformModalCloseReason = "backdrop" | "escape" | "close-button";
export type PlatformModalHeaderVariant = "default" | "search" | "media";

export interface PlatformModalHeaderSearchProps extends PlatformSearchProps {
  inputRef?: Ref<HTMLInputElement>;
}

export interface PlatformModalSurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: PlatformModalSize;
  structured?: boolean;
  visible?: boolean;
  closing?: boolean;
  width?: CSSProperties["width"];
  maxWidth?: CSSProperties["maxWidth"];
  maxHeight?: CSSProperties["maxHeight"];
  scrollable?: boolean;
  animateResize?: boolean;
  resizeAnimationDurationMs?: number;
}

export interface PlatformModalBackdropProps extends HTMLAttributes<HTMLDivElement> {
  visible?: boolean;
  closing?: boolean;
}

export interface PlatformModalProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  headerVariant?: PlatformModalHeaderVariant;
  headerSearchProps?: PlatformModalHeaderSearchProps;
  headerMedia?: ReactNode;
  headerLeading?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
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
  animateResize?: boolean;
  resizeAnimationDurationMs?: number;
  visible?: boolean;
  closing?: boolean;
  animationDurationMs?: number;
  className?: string;
  backdropClassName?: string;
  showHeader?: boolean;
  showBody?: boolean;
  showFooter?: boolean;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  closeButtonClassName?: string;
  closeButtonLabel?: string;
  closeButtonDisabled?: boolean;
  surfaceRef?: Ref<HTMLElement>;
  backdropRef?: Ref<HTMLDivElement>;
  bodyProps?: Omit<HTMLAttributes<HTMLDivElement>, "children" | "className">;
  footerProps?: Omit<HTMLAttributes<HTMLDivElement>, "children" | "className">;
  surfaceProps?: Omit<PlatformModalSurfaceProps, "animateResize" | "as" | "children" | "className" | "resizeAnimationDurationMs" | "size" | "structured" | "visible" | "closing">;
  backdropProps?: Omit<PlatformModalBackdropProps, "children" | "className" | "visible" | "closing">;
  role?: "dialog" | "alertdialog";
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
}

export interface PlatformModalHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "onClose"> {
  variant?: PlatformModalHeaderVariant;
  title?: ReactNode;
  description?: ReactNode;
  searchProps?: PlatformModalHeaderSearchProps;
  media?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  titleId?: string;
  descriptionId?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  onClose?: () => void;
  closeButtonClassName?: string;
  closeButtonLabel?: string;
  closeButtonDisabled?: boolean;
}

export interface PlatformModalSplitLayoutProps extends HTMLAttributes<HTMLDivElement> {}

export interface PlatformModalSidebarProps
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  headerActions?: ReactNode;
  headerClassName?: string;
  titleClassName?: string;
  bodyClassName?: string;
}

export interface PlatformModalContentProps extends HTMLAttributes<HTMLElement> {
  header?: ReactNode;
  footer?: ReactNode;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
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

function scheduleModalAnimationFrame(callback: FrameRequestCallback) {
  if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
    return { kind: "frame" as const, id: window.requestAnimationFrame(callback) };
  }
  return {
    kind: "timeout" as const,
    id: globalThis.setTimeout(() => callback(Date.now()), 0),
  };
}

function cancelModalAnimationFrame(
  scheduled: ReturnType<typeof scheduleModalAnimationFrame> | null,
) {
  if (!scheduled) return;
  if (
    scheduled.kind === "frame"
    && typeof window !== "undefined"
    && typeof window.cancelAnimationFrame === "function"
  ) {
    window.cancelAnimationFrame(scheduled.id);
    return;
  }
  globalThis.clearTimeout(scheduled.id);
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

function flattenModalChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    if (
      isValidElement<{ children?: ReactNode }>(child)
      && child.type === Fragment
    ) {
      return flattenModalChildren(child.props.children);
    }
    return [child];
  });
}

function partitionModalChildren(children: ReactNode) {
  const bodyElements: ReactNode[] = [];
  const footerElements: ReactNode[] = [];
  const bodyContent: ReactNode[] = [];

  for (const child of flattenModalChildren(children)) {
    if (isValidElement(child) && child.type === PlatformModalBody) {
      bodyElements.push(child);
    } else if (isValidElement(child) && child.type === PlatformModalFooter) {
      footerElements.push(child);
    } else {
      bodyContent.push(child);
    }
  }

  return {
    bodyContent,
    bodyElements,
    footerElements,
  };
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
    structured = false,
    visible,
    closing,
    width,
    maxWidth,
    maxHeight,
    scrollable = false,
    animateResize = true,
    resizeAnimationDurationMs = 140,
    className = "",
    children,
    style,
    ...props
  }, forwardedRef) {
    const resolvedClosing = closing ?? className.split(/\s+/).includes("is-closing");
    const resolvedVisible = visible ?? !resolvedClosing;
    const localSurfaceRef = useRef<HTMLElement | null>(null);
    const setSurfaceRef = useCallback((element: HTMLElement | null) => {
      localSurfaceRef.current = element;
      assignRef(forwardedRef, element);
    }, [forwardedRef]);
    useModalResizeTransition(localSurfaceRef, {
      active: resolvedVisible && !resolvedClosing,
      enabled: animateResize,
      durationMs: resizeAnimationDurationMs,
    });
    return createElement(as, {
      ...props,
      ref: setSurfaceRef,
      className: joinClassNames(
        "platform-modal-surface",
        "playground-platform-modal",
        `is-size-${size}`,
        structured && "is-structured",
        resolvedVisible && "is-visible",
        resolvedClosing && "is-closing",
        scrollable && "is-scrollable",
        className
      ),
      "data-platform-modal-state": resolvedClosing ? "closing" : resolvedVisible ? "visible" : "opening",
      "data-platform-modal-resize": animateResize ? "animated" : undefined,
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
  headerVariant = "default",
  headerSearchProps,
  headerMedia,
  headerLeading,
  headerActions,
  footer,
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
  animateResize = true,
  resizeAnimationDurationMs = 140,
  visible: controlledVisible,
  closing = false,
  animationDurationMs = 60,
  className = "",
  backdropClassName = "",
  showHeader = true,
  showBody = true,
  showFooter = true,
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  titleClassName = "",
  descriptionClassName = "",
  closeButtonClassName = "",
  closeButtonLabel = "Close modal",
  closeButtonDisabled = false,
  surfaceRef,
  backdropRef,
  bodyProps = {},
  footerProps = {},
  surfaceProps = {},
  backdropProps = {},
  role = "dialog",
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
}: PlatformModalProps) {
  const generatedId = useId().replace(/:/g, "");
  const [retained, setRetained] = useState(open);
  const [entered, setEntered] = useState(false);
  const localSurfaceRef = useRef<HTMLElement | null>(null);
  const localHeaderSearchInputRef = useRef<HTMLInputElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const onExitedRef = useRef(onExited);
  const shouldRender = open || retained;
  const resolvedAnimationDurationMs = Math.max(0, animationDurationMs);
  const resolvedClosing = closing || (!open && shouldRender);
  const resolvedVisible = !resolvedClosing && (controlledVisible ?? (open && entered));
  const titleId = ariaLabelledBy || `platform-modal-title-${generatedId}`;
  const descriptionId = ariaDescribedBy || `platform-modal-description-${generatedId}`;
  const forwardedHeaderSearchInputRef = headerSearchProps?.inputRef;
  const setHeaderSearchInputRef = useCallback((element: HTMLInputElement | null) => {
    localHeaderSearchInputRef.current = element;
    assignRef(forwardedHeaderSearchInputRef, element);
  }, [forwardedHeaderSearchInputRef]);

  useLayoutEffect(() => {
    onExitedRef.current = onExited;
  }, [onExited]);

  useEffect(() => {
    if (open) {
      setRetained(true);
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      setEntered(false);
      return undefined;
    }
    const scheduledFrame = scheduleModalAnimationFrame(() => setEntered(true));
    return () => cancelModalAnimationFrame(scheduledFrame);
  }, [open]);

  useEffect(() => {
    if (open || !retained) return;
    const timer = window.setTimeout(() => {
      setRetained(false);
      onExitedRef.current?.();
    }, resolvedAnimationDurationMs);
    return () => window.clearTimeout(timer);
  }, [open, resolvedAnimationDurationMs, retained]);

  useEffect(() => {
    if (!shouldRender || !lockScroll) return;
    lockDocumentScroll();
    return unlockDocumentScroll;
  }, [lockScroll, shouldRender]);

  useLayoutEffect(() => {
    if (!shouldRender || !resolvedVisible || typeof document === "undefined") return;
    previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const surface = localSurfaceRef.current;
    const preferred = initialFocusRef?.current
      ?? (headerVariant === "search" ? localHeaderSearchInputRef.current : null);
    const target = preferred && surface?.contains(preferred)
      ? preferred
      : getFocusableElements(surface)[0] || surface;
    target?.focus({ preventScroll: true });
    return () => {
      if (restoreFocus) previouslyFocusedRef.current?.focus({ preventScroll: true });
    };
  }, [headerVariant, initialFocusRef, resolvedVisible, restoreFocus, shouldRender]);

  useEffect(() => {
    if (!shouldRender || typeof document === "undefined") return;
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
  }, [closeOnEscape, onClose, shouldRender, trapFocus]);

  if (!shouldRender) return null;

  const {
    bodyContent,
    bodyElements,
    footerElements,
  } = partitionModalChildren(children);
  const {
    onClick: surfaceOnClick,
    tabIndex: surfaceTabIndex,
    ...restSurfaceProps
  } = surfaceProps;
  const {
    onClick: backdropOnClick,
    style: backdropStyle,
    ...restBackdropProps
  } = backdropProps;
  const modal = (
    <PlatformModalBackdrop
      {...restBackdropProps}
      ref={(element) => assignRef(backdropRef, element)}
      className={backdropClassName}
      visible={resolvedVisible}
      closing={resolvedClosing}
      style={{
        "--platform-modal-animation-duration": `${resolvedAnimationDurationMs}ms`,
        ...backdropStyle,
      } as CSSProperties}
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
        structured
        visible={resolvedVisible}
        closing={resolvedClosing}
        width={width}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        scrollable={scrollable}
        animateResize={animateResize}
        resizeAnimationDurationMs={resizeAnimationDurationMs}
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
        {showHeader && title != null ? (
          <PlatformModalHeader
            className={headerClassName}
            variant={headerVariant}
            title={title}
            description={description}
            searchProps={headerVariant === "search" ? {
              ...headerSearchProps,
              inputRef: setHeaderSearchInputRef,
            } : undefined}
            media={headerVariant === "media" ? headerMedia : undefined}
            leading={headerLeading}
            actions={headerActions}
            titleId={titleId}
            descriptionId={descriptionId}
            titleClassName={titleClassName}
            descriptionClassName={descriptionClassName}
            onClose={typeof onClose === "function" ? () => onClose("close-button") : undefined}
            closeButtonClassName={closeButtonClassName}
            closeButtonLabel={closeButtonLabel}
            closeButtonDisabled={closeButtonDisabled}
          />
        ) : title != null ? (
          <>
            <h2
              id={titleId}
              className={joinClassNames(
                "platform-modal-header__title",
                "platform-modal-header__visually-hidden",
                titleClassName,
              )}
            >
              {title}
            </h2>
            {description != null ? (
              <p
                id={descriptionId}
                className={joinClassNames(
                  "platform-modal-header__description",
                  "platform-modal-header__visually-hidden",
                  descriptionClassName,
                )}
              >
                {description}
              </p>
            ) : null}
          </>
        ) : null}
        {showBody ? (
          <>
            {bodyContent.length > 0 || bodyElements.length === 0 ? (
              <PlatformModalBody
                {...bodyProps}
                className={bodyClassName}
              >
                {bodyContent}
              </PlatformModalBody>
            ) : null}
            {bodyElements}
          </>
        ) : null}
        {showFooter ? (
          <>
            {footerElements}
            {footer !== undefined || footerElements.length === 0 ? (
              <PlatformModalFooter
                {...footerProps}
                className={footerClassName}
              >
                {footer}
              </PlatformModalFooter>
            ) : null}
          </>
        ) : null}
      </PlatformModalSurface>
    </PlatformModalBackdrop>
  );

  const target = portalTarget ?? (typeof document !== "undefined" ? document.body : null);
  return portal && target ? createPortal(modal, target) : modal;
}

export function PlatformModalHeader({
  variant = "default",
  title,
  description,
  searchProps = {},
  media,
  leading,
  actions,
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
  const isTitleOnly = (
    variant === "default"
    && title != null
    && description == null
    && leading == null
    && actions == null
    && children == null
  );
  const closeControl = onClose ? (
    <button
      type="button"
      className={joinClassNames("platform-modal-header__close", closeButtonClassName)}
      aria-label={closeButtonLabel}
      onClick={onClose}
      disabled={closeButtonDisabled}
    >
      <X width={16} height={16} strokeWidth={2} aria-hidden="true" />
    </button>
  ) : null;

  if (variant === "media") {
    return (
      <div
        {...props}
        data-platform-modal-part="header"
        className={joinClassNames("platform-modal-header", "is-media", className)}
      >
        {title != null ? (
          <h2
            id={titleId}
            className={joinClassNames(
              "platform-modal-header__title",
              "platform-modal-header__visually-hidden",
              titleClassName,
            )}
          >
            {title}
          </h2>
        ) : null}
        {description != null ? (
          <p
            id={descriptionId}
            className={joinClassNames(
              "platform-modal-header__description",
              "platform-modal-header__visually-hidden",
              descriptionClassName,
            )}
          >
            {description}
          </p>
        ) : null}
        <div className="platform-modal-header__media">{media}</div>
        {actions != null ? (
          <div className="platform-modal-header__actions">{actions}</div>
        ) : null}
        {closeControl}
        {children}
      </div>
    );
  }

  if (variant === "search") {
    const {
      inputRef,
      className: searchClassName = "",
      inputClassName: searchInputClassName = "",
      autoFocus = true,
      ...inputProps
    } = searchProps;
    return (
      <div
        {...props}
        data-platform-modal-part="header"
        className={joinClassNames("platform-modal-header", "is-search", className)}
      >
        {title != null ? (
          <h2
            id={titleId}
            className={joinClassNames(
              "platform-modal-header__title",
              "platform-modal-header__visually-hidden",
              titleClassName,
            )}
          >
            {title}
          </h2>
        ) : null}
        {description != null ? (
          <p
            id={descriptionId}
            className={joinClassNames(
              "platform-modal-header__description",
              "platform-modal-header__visually-hidden",
              descriptionClassName,
            )}
          >
            {description}
          </p>
        ) : null}
        {leading != null ? (
          <div className="platform-modal-header__leading">{leading}</div>
        ) : null}
        <PlatformSearch
          {...inputProps}
          ref={inputRef}
          autoFocus={autoFocus}
          className={joinClassNames("platform-modal-header__search", searchClassName)}
          inputClassName={joinClassNames(
            "platform-modal-header__search-input",
            searchInputClassName,
          )}
        />
        {actions != null ? (
          <div className="platform-modal-header__actions">{actions}</div>
        ) : null}
        {closeControl}
        {children}
      </div>
    );
  }

  if (title == null) {
    return (
      <div
        {...props}
        data-platform-modal-part="header"
        className={joinClassNames("platform-modal-header", className)}
      >
        {children}
      </div>
    );
  }
  return (
    <div
      {...props}
      data-platform-modal-part="header"
      className={joinClassNames(
        "platform-modal-header",
        isTitleOnly && "is-title-only",
        className,
      )}
    >
      {leading != null ? (
        <div className="platform-modal-header__leading">{leading}</div>
      ) : null}
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
      {actions != null ? (
        <div className="platform-modal-header__actions">{actions}</div>
      ) : null}
      {closeControl}
      {children}
    </div>
  );
}

export function PlatformModalBody({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      data-platform-modal-part="body"
      className={joinClassNames("platform-modal-body", className)}
    />
  );
}

export function PlatformModalFooter({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      data-platform-modal-part="footer"
      className={joinClassNames("platform-modal-footer", className)}
    />
  );
}

export function PlatformModalSplitLayout({
  className = "",
  ...props
}: PlatformModalSplitLayoutProps) {
  return (
    <div
      {...props}
      data-platform-modal-layout="split"
      className={joinClassNames("platform-modal-split-layout", className)}
    />
  );
}

export function PlatformModalSidebar({
  title,
  headerActions,
  headerClassName = "",
  titleClassName = "",
  bodyClassName = "",
  className = "",
  children,
  ...props
}: PlatformModalSidebarProps) {
  return (
    <aside
      {...props}
      data-platform-modal-part="sidebar"
      className={joinClassNames("platform-modal-sidebar", className)}
    >
      <div
        className={joinClassNames("platform-modal-sidebar__header", headerClassName)}
        data-platform-modal-pane-part="header"
      >
        <div
          className={joinClassNames("platform-modal-sidebar__title", titleClassName)}
        >
          {title}
        </div>
        {headerActions != null ? (
          <div className="platform-modal-sidebar__header-actions">{headerActions}</div>
        ) : null}
      </div>
      <div
        className={joinClassNames("platform-modal-sidebar__body", bodyClassName)}
        data-platform-modal-pane-part="body"
      >
        {children}
      </div>
    </aside>
  );
}

export function PlatformModalContent({
  header,
  footer,
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  className = "",
  children,
  ...props
}: PlatformModalContentProps) {
  return (
    <section
      {...props}
      data-platform-modal-part="content"
      className={joinClassNames("platform-modal-content", className)}
    >
      <div
        className={joinClassNames("platform-modal-content__header", headerClassName)}
        data-platform-modal-pane-part="header"
      >
        {header}
      </div>
      <div
        className={joinClassNames("platform-modal-content__body", bodyClassName)}
        data-platform-modal-pane-part="body"
      >
        {children}
      </div>
      {footer != null ? (
        <div
          className={joinClassNames("platform-modal-content__footer", footerClassName)}
          data-platform-modal-pane-part="footer"
        >
          {footer}
        </div>
      ) : null}
    </section>
  );
}

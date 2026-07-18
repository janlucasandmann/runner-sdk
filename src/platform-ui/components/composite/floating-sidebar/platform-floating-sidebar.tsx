import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { PlatformIconButton } from "../../ui/icon-button/index.js";

export type PlatformFloatingSidebarCloseReason = "close-button" | "escape";
export type PlatformFloatingSidebarPosition = "absolute" | "fixed";

export interface PlatformFloatingSidebarProps {
  open: boolean;
  title: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  headerActions?: ReactNode;
  onClose: (reason: PlatformFloatingSidebarCloseReason) => void;
  onExited?: () => void;
  closeOnEscape?: boolean;
  portal?: boolean;
  portalTarget?: Element | DocumentFragment | null;
  position?: PlatformFloatingSidebarPosition;
  width?: CSSProperties["width"];
  zIndex?: CSSProperties["zIndex"];
  animationDurationMs?: number;
  ariaLabel?: string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  closeButtonClassName?: string;
  closeButtonLabel?: string;
  style?: CSSProperties;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter((className): className is string => typeof className === "string" && Boolean(className.trim()))
    .map((className) => className.trim())
    .join(" ");
}

function scheduleAnimationFrame(callback: FrameRequestCallback) {
  if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
    return { kind: "frame" as const, id: window.requestAnimationFrame(callback) };
  }
  return {
    kind: "timeout" as const,
    id: globalThis.setTimeout(() => callback(Date.now()), 0),
  };
}

function cancelScheduledAnimationFrame(
  scheduled: ReturnType<typeof scheduleAnimationFrame> | null,
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

export function PlatformFloatingSidebar({
  open,
  title,
  children,
  footer,
  headerActions,
  onClose,
  onExited,
  closeOnEscape = true,
  portal = false,
  portalTarget,
  position = "absolute",
  width,
  zIndex,
  animationDurationMs = 240,
  ariaLabel,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  closeButtonClassName = "",
  closeButtonLabel = "Close sidebar",
  style,
}: PlatformFloatingSidebarProps) {
  const titleId = useId();
  const [retained, setRetained] = useState(Boolean(open));
  const [visible, setVisible] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useLayoutEffect(() => {
    if (exitTimerRef.current) {
      globalThis.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    let scheduledFrame: ReturnType<typeof scheduleAnimationFrame> | null = null;
    if (open) {
      setRetained(true);
      scheduledFrame = scheduleAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      if (retained) {
        exitTimerRef.current = globalThis.setTimeout(() => {
          setRetained(false);
          exitTimerRef.current = null;
          onExited?.();
        }, Math.max(0, animationDurationMs));
      }
    }

    return () => {
      cancelScheduledAnimationFrame(scheduledFrame);
      if (exitTimerRef.current) {
        globalThis.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [animationDurationMs, onExited, open, retained]);

  useEffect(() => {
    if (!open || !closeOnEscape || typeof window === "undefined") return undefined;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      onClose("escape");
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [closeOnEscape, onClose, open]);

  if (!retained) return null;

  const resolvedPortalTarget = portalTarget
    ?? (typeof document !== "undefined" ? document.body : null);
  const sidebar = (
    <aside
      className={joinClassNames(
        "platform-floating-sidebar",
        position === "fixed" && "is-fixed",
        className,
      )}
      data-platform-floating-sidebar="true"
      data-state={visible ? "open" : "closed"}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : titleId}
      aria-hidden={visible ? undefined : true}
      inert={visible ? undefined : true}
      style={{
        ...style,
        width: width ?? style?.width,
        zIndex: zIndex ?? style?.zIndex,
        "--platform-floating-sidebar-animation-duration": `${Math.max(0, animationDurationMs)}ms`,
      } as CSSProperties}
    >
      <header
        className={joinClassNames(
          "platform-floating-sidebar__header",
          headerClassName,
        )}
      >
        <h2 id={titleId} className="platform-floating-sidebar__title">{title}</h2>
        <div className="platform-floating-sidebar__header-actions">
          {headerActions}
          <PlatformIconButton
            className={joinClassNames(
              "platform-floating-sidebar__close",
              closeButtonClassName,
            )}
            size="small"
            aria-label={closeButtonLabel}
            onClick={() => onClose("close-button")}
          >
            <X aria-hidden="true" />
          </PlatformIconButton>
        </div>
      </header>
      <div
        className={joinClassNames(
          "platform-floating-sidebar__body",
          bodyClassName,
        )}
      >
        {children}
      </div>
      {footer !== undefined && footer !== null ? (
        <footer
          className={joinClassNames(
            "platform-floating-sidebar__footer",
            footerClassName,
          )}
        >
          {footer}
        </footer>
      ) : null}
    </aside>
  );

  return portal && resolvedPortalTarget
    ? createPortal(sidebar, resolvedPortalTarget)
    : sidebar;
}

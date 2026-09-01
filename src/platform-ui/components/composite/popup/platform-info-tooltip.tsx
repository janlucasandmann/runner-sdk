import { Info } from "../../ui/hugeicons-compat.js";
import {
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  joinPlatformPopupClassNames,
  PlatformPopup,
  type PlatformPopupPlacement,
} from "./platform-popup.js";

export interface PlatformInfoTooltipProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> {
  action?: PlatformInfoTooltipAction;
  ariaLabel?: string;
  description: ReactNode;
  placement?: PlatformPopupPlacement;
  /** @deprecated Fold this copy into `description`; retained for runtime adapters. */
  runtime?: ReactNode;
  title?: ReactNode;
}

export interface PlatformInfoTooltipAction {
  ariaLabel?: string;
  disabled?: boolean;
  icon?: ReactNode;
  label: ReactNode;
  onSelect: () => void;
}

const PLATFORM_INFO_TOOLTIP_CLOSE_DELAY_MS = 100;

/**
 * Centralized explanatory info affordance for compact form labels.
 *
 * The tooltip is portaled so it is not clipped by dialogs, tables, or
 * horizontally scrolling settings rows. Hover, keyboard focus, and click all
 * expose the same content, while the trigger remains a real accessible button.
 */
export function PlatformInfoTooltip({
  action,
  ariaLabel = "More information",
  className = "",
  description,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  placement = "bottom-center",
  runtime,
  title,
  ...props
}: PlatformInfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const tooltipId = useId();

  const cancelScheduledClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const showTooltip = useCallback(() => {
    cancelScheduledClose();
    setOpen(true);
  }, [cancelScheduledClose]);

  const scheduleTooltipClose = useCallback(() => {
    cancelScheduledClose();
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      setOpen(false);
    }, PLATFORM_INFO_TOOLTIP_CLOSE_DELAY_MS);
  }, [cancelScheduledClose]);

  useEffect(() => () => cancelScheduledClose(), [cancelScheduledClose]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      cancelScheduledClose();
      setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        rootRef.current?.contains(target) ||
        surfaceRef.current?.contains(target)
      ) {
        return;
      }
      cancelScheduledClose();
      setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [cancelScheduledClose, open]);

  return (
    <PlatformPopup
      open={open}
      portal
      variant="minimal"
      placement={placement}
      portalOffset={9}
      portalCollisionPadding={12}
      rootRef={rootRef}
      surfaceRef={surfaceRef}
      rootClassName={joinPlatformPopupClassNames("platform-info-tooltip", className)}
      rootProps={{
        ...props,
        onBlur: (event) => {
          onBlur?.(event);
          scheduleTooltipClose();
        },
        onFocus: (event) => {
          onFocus?.(event);
          showTooltip();
        },
        onMouseEnter: (event) => {
          onMouseEnter?.(event);
          showTooltip();
        },
        onMouseLeave: (event) => {
          onMouseLeave?.(event);
          scheduleTooltipClose();
        },
      }}
      trigger={
        <button
          type="button"
          className="platform-info-tooltip__trigger"
          aria-label={ariaLabel}
          aria-controls={open ? tooltipId : undefined}
          aria-describedby={!action && open ? tooltipId : undefined}
          aria-expanded={action ? open : undefined}
          aria-haspopup={action ? "dialog" : undefined}
          data-platform-info-tooltip-trigger="true"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            showTooltip();
          }}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <Info aria-hidden="true" strokeWidth={1.8} />
        </button>
      }
      surfaceClassName="platform-info-tooltip__surface"
      surfaceProps={{
        id: tooltipId,
        role: action ? "dialog" : "tooltip",
        "aria-label": action ? ariaLabel : undefined,
        onBlur: scheduleTooltipClose,
        onFocus: cancelScheduledClose,
        onMouseEnter: cancelScheduledClose,
        onMouseLeave: scheduleTooltipClose,
      }}
    >
      {title ? <span className="platform-info-tooltip__title">{title}</span> : null}
      <span className="platform-info-tooltip__description">
        {description}
        {runtime ? <> {runtime}</> : null}
      </span>
      {action ? (
        <button
          type="button"
          className="platform-info-tooltip__action"
          aria-label={action.ariaLabel}
          disabled={action.disabled}
          onClick={() => {
            cancelScheduledClose();
            setOpen(false);
            action.onSelect();
          }}
        >
          <span className="platform-info-tooltip__action-label">
            {action.label}
          </span>
          {action.icon ? (
            <span className="platform-info-tooltip__action-icon" aria-hidden="true">
              {action.icon}
            </span>
          ) : null}
        </button>
      ) : null}
    </PlatformPopup>
  );
}

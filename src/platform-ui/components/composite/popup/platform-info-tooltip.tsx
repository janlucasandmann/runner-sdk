import { Info } from "lucide-react";
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
  ariaLabel?: string;
  description: ReactNode;
  placement?: PlatformPopupPlacement;
  runtime?: ReactNode;
  title?: ReactNode;
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
  ariaLabel = "More information",
  className = "",
  description,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  placement = "top-start",
  runtime,
  title,
  ...props
}: PlatformInfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [cancelScheduledClose, open]);

  return (
    <PlatformPopup
      open={open}
      portal
      variant="minimal"
      placement={placement}
      portalOffset={6}
      portalCollisionPadding={12}
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
          aria-describedby={open ? tooltipId : undefined}
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
        role: "tooltip",
        onMouseEnter: cancelScheduledClose,
        onMouseLeave: scheduleTooltipClose,
      }}
    >
      {title ? <span className="platform-info-tooltip__title">{title}</span> : null}
      <span className="platform-info-tooltip__description">{description}</span>
      {runtime ? (
        <span className="platform-info-tooltip__runtime">
          <span className="platform-info-tooltip__runtime-label">At runtime</span>
          <span>{runtime}</span>
        </span>
      ) : null}
    </PlatformPopup>
  );
}

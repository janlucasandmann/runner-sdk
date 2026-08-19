import { type HTMLAttributes, type ReactNode, useEffect, useState } from "react";

export interface PlatformStatusIndicatorItem {
  id: string;
  title: ReactNode;
  copy?: ReactNode;
  icon?: ReactNode;
  logoUrl?: string;
  brand?: "github";
  progress?: number;
  indeterminate?: boolean;
}

export interface PlatformStatusIndicatorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
    Omit<PlatformStatusIndicatorItem, "id"> {
  onDismiss?: () => void;
  dismissLabel?: string;
  exitDurationMs?: number;
}

export interface PlatformStatusIndicatorStackProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  items: readonly PlatformStatusIndicatorItem[];
  dismissedIds?: readonly string[];
  onDismiss?: (id: string) => void;
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

function PlatformStatusIndicatorGitHubLogo() {
  return (
    <svg
      className="platform-status-indicator__logo status-indicator-logo"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.72-4.03-1.42-4.03-1.42-.55-1.38-1.33-1.75-1.33-1.75-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.8c1.02 0 2.05.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.69.8.58A12 12 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

function PlatformStatusIndicatorCloseIcon() {
  return (
    <svg
      className="platform-status-indicator__close-icon status-indicator-close-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function PlatformStatusIndicator({
  title,
  copy,
  icon,
  logoUrl,
  brand,
  progress,
  indeterminate = false,
  onDismiss,
  dismissLabel,
  exitDurationMs = 180,
  className = "",
  ...props
}: PlatformStatusIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const hasProgress = Number.isFinite(progress) || indeterminate;
  const normalizedProgress = Number.isFinite(progress)
    ? Math.max(0, Math.min(100, Number(progress)))
    : 0;
  const hasMedia = Boolean(icon || logoUrl || brand);
  const accessibleTitle = typeof title === "string" ? title : "Status update";

  useEffect(() => {
    const requestFrame = globalThis.requestAnimationFrame;
    if (typeof requestFrame !== "function") {
      setIsVisible(true);
      return undefined;
    }
    const frameId = requestFrame(() => setIsVisible(true));
    return () => globalThis.cancelAnimationFrame?.(frameId);
  }, []);

  function handleDismiss() {
    if (!onDismiss || isExiting) return;
    setIsExiting(true);
    globalThis.setTimeout(onDismiss, Math.max(0, exitDurationMs));
  }

  return (
    <div
      {...props}
      className={joinClassNames(
        "platform-status-indicator",
        "status-indicator",
        isVisible && !isExiting && "is-visible",
        isExiting && "is-exiting",
        className,
      )}
      role={props.role || "status"}
      aria-live={props["aria-live"] || "polite"}
    >
      {hasMedia ? (
        <div className="platform-status-indicator__media status-indicator-media" aria-hidden="true">
          {icon ? (
            <span className="platform-status-indicator__icon">{icon}</span>
          ) : brand === "github" ? (
            <PlatformStatusIndicatorGitHubLogo />
          ) : (
            <img
              className="platform-status-indicator__logo status-indicator-logo"
              src={logoUrl}
              alt=""
              aria-hidden="true"
              draggable={false}
            />
          )}
        </div>
      ) : null}
      <div className="platform-status-indicator__body status-indicator-body">
        <div className="platform-status-indicator__title status-indicator-title">{title}</div>
        {copy !== undefined && copy !== null ? (
          <div className="platform-status-indicator__copy status-indicator-copy">{copy}</div>
        ) : null}
        {hasProgress ? (
          <div className="platform-status-indicator__progress status-indicator-progress">
            <div
              className={joinClassNames(
                "platform-status-indicator__progress-fill",
                "status-indicator-progress-fill",
                indeterminate && "is-indeterminate",
              )}
              style={indeterminate ? undefined : { width: `${normalizedProgress}%` }}
            />
          </div>
        ) : null}
      </div>
      {onDismiss ? (
        <button
          type="button"
          className="platform-status-indicator__close status-indicator-close"
          onClick={handleDismiss}
          aria-label={dismissLabel || `Dismiss ${accessibleTitle}`}
        >
          <PlatformStatusIndicatorCloseIcon />
        </button>
      ) : null}
    </div>
  );
}

export function PlatformStatusIndicatorStack({
  items,
  dismissedIds = [],
  onDismiss,
  className = "",
  ...props
}: PlatformStatusIndicatorStackProps) {
  const dismissed = new Set(dismissedIds);
  const visibleItems = items.filter((item) => !dismissed.has(item.id));
  if (visibleItems.length === 0) return null;

  return (
    <div
      {...props}
      className={joinClassNames(
        "platform-status-indicator-stack",
        "status-indicator-stack",
        className,
      )}
    >
      <div className="platform-status-indicator-list status-indicator-list">
        {visibleItems.map((item) => (
          <PlatformStatusIndicator
            key={item.id}
            title={item.title}
            copy={item.copy}
            icon={item.icon}
            logoUrl={item.logoUrl}
            brand={item.brand}
            progress={item.progress}
            indeterminate={item.indeterminate}
            onDismiss={onDismiss ? () => onDismiss(item.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

export interface CompactActionLogLineProps {
  icon: ReactNode;
  title: string;
  detail?: string | null;
  onClick?: (() => void) | null;
  className?: string;
  ariaLabel?: string;
}

export function CompactActionLogLine({
  icon,
  title,
  detail,
  onClick,
  className,
  ariaLabel,
}: CompactActionLogLineProps) {
  const normalizedDetail = String(detail || "").trim();
  const content = (
    <>
      <span className="tb-log-compact-action-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="tb-log-compact-action-title">{title}</span>
      {normalizedDetail ? (
        <span className="tb-log-compact-action-detail" title={normalizedDetail}>
          {normalizedDetail}
        </span>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={`tb-log-compact-action ${className || ""}`.trim()}
        onClick={onClick}
        aria-label={
          ariaLabel || [title, normalizedDetail].filter(Boolean).join(" ")
        }
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`tb-log-compact-action is-static ${className || ""}`.trim()}
    >
      {content}
    </div>
  );
}

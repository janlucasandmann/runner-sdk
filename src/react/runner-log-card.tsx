import type { ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export function LogHeader({
  icon,
  label,
  title,
  timeLabel,
  meta,
  collapsed,
  onToggle,
  className,
}: {
  icon: ReactNode;
  label: string;
  title?: string | null;
  timeLabel?: string;
  meta?: ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button type="button" className={`tb-log-card-header ${className || ""}`.trim()} onClick={onToggle}>
      <span className="tb-log-card-icon">{icon}</span>
      <div className="tb-log-card-header-copy">
        <span className="tb-log-card-label">{label}</span>
        {title ? <span className="tb-log-card-title">{title}</span> : null}
      </div>
      <div className="tb-log-card-header-right">
        {meta}
        {timeLabel ? <span className="tb-log-card-time">{timeLabel}</span> : null}
        {collapsed ? <ChevronRight className="tb-log-card-chevron" strokeWidth={1.5} /> : <ChevronDown className="tb-log-card-chevron" strokeWidth={1.5} />}
      </div>
    </button>
  );
}

export function LogPanel({
  children,
  collapsed,
}: {
  children: ReactNode;
  collapsed: boolean;
}) {
  if (collapsed) return null;
  return <div className="tb-log-card-panel">{children}</div>;
}

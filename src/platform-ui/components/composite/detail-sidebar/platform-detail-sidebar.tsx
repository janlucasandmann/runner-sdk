import type { ReactNode } from "react";

export interface PlatformDetailSidebarProps {
  children: ReactNode;
  ariaLabel?: string;
  collapsed?: boolean;
  className?: string;
}

export interface PlatformDetailSidebarSectionProps {
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PlatformDetailSidebar({
  children,
  ariaLabel = "Resource details",
  collapsed = false,
  className = "",
}: PlatformDetailSidebarProps) {
  return (
    <aside
      className={`platform-detail-sidebar${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel}
      aria-hidden={collapsed || undefined}
      inert={collapsed ? true : undefined}
      data-platform-detail-sidebar="true"
      data-collapsed={collapsed ? "true" : "false"}
    >
      {children}
    </aside>
  );
}

export function PlatformDetailSidebarSection({
  title,
  actions,
  children,
  className = "",
}: PlatformDetailSidebarSectionProps) {
  return (
    <section className={`platform-detail-sidebar__section${className ? ` ${className}` : ""}`}>
      {title || actions ? (
        <header className="platform-detail-sidebar__section-header">
          {title ? <h2 className="platform-detail-sidebar__section-title">{title}</h2> : <span />}
          {actions ? <div className="platform-detail-sidebar__section-actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className="platform-detail-sidebar__section-body">{children}</div>
    </section>
  );
}

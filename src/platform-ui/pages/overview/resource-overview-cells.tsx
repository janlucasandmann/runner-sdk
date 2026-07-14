import type { ComponentType } from "react";

interface ResourceOverviewIdentityCellProps {
  title: string;
  imageUrl?: string;
  imageClassName?: string;
  fallback?: string;
  icon?: ComponentType<{ width?: number; height?: number; strokeWidth?: number }>;
  iconClassName?: string;
}

export function ResourceOverviewIdentityCell({
  title,
  imageUrl,
  imageClassName = "",
  fallback = "",
  icon: Icon,
  iconClassName = "",
}: ResourceOverviewIdentityCellProps) {
  return (
    <div className="resource-overview-identity">
      <span className={`resource-overview-identity__visual${iconClassName ? ` ${iconClassName}` : ""}`} aria-hidden="true">
        {imageUrl ? <img src={imageUrl} alt="" className={imageClassName} /> : Icon ? <Icon width={17} height={17} strokeWidth={1.8} /> : fallback}
      </span>
      <span className="resource-overview-identity__title">{title}</span>
    </div>
  );
}

export function ResourceOverviewStatus({ active, activeLabel = "Active", inactiveLabel = "Inactive" }: {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return <span className={`resource-overview-status${active ? " is-active" : ""}`}>{active ? activeLabel : inactiveLabel}</span>;
}

export function ResourceOverviewValue({ children, title }: { children: React.ReactNode; title?: string }) {
  return <span className="resource-overview-value" title={title}>{children}</span>;
}

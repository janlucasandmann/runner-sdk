import type { ComponentType, CSSProperties, ReactNode } from "react";

type ResourceOverviewIdentitySize = "standard" | "compact";

interface ResourceOverviewIdentityCellProps {
  title: string;
  imageUrl?: string;
  imageClassName?: string;
  fallback?: string;
  icon?: ComponentType<{ width?: number; height?: number; strokeWidth?: number }>;
  iconClassName?: string;
  size?: ResourceOverviewIdentitySize;
}

interface ResourceOverviewCatalogIdentityCellProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  iconClassName?: string;
  iconStyle?: CSSProperties;
  className?: string;
}

export function ResourceOverviewCatalogIdentityCell({
  title,
  description,
  icon,
  iconClassName = "",
  iconStyle,
  className = "",
}: ResourceOverviewCatalogIdentityCellProps) {
  return (
    <div className={`resource-overview-identity is-catalog${className ? ` ${className}` : ""}`}>
      {icon != null ? (
        <span
          className={`resource-overview-identity__visual${iconClassName ? ` ${iconClassName}` : ""}`}
          style={iconStyle}
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      <span className="resource-overview-identity__copy">
        <span className="resource-overview-identity__title">{title}</span>
        {description ? (
          <span className="resource-overview-identity__description">
            {description}
          </span>
        ) : null}
      </span>
    </div>
  );
}

export function ResourceOverviewIdentityCell({
  title,
  imageUrl,
  imageClassName = "",
  fallback = "",
  icon: Icon,
  iconClassName = "",
  size = "standard",
}: ResourceOverviewIdentityCellProps) {
  return (
    <div className="resource-overview-identity">
      <span className={`resource-overview-identity__visual is-size-${size}${iconClassName ? ` ${iconClassName}` : ""}`} aria-hidden="true">
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

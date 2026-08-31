import type { CSSProperties, ReactNode } from "react";
import {
  ResourceOverviewCatalogIdentityCell,
  ResourceOverviewIdentityCell,
} from "./resource-overview-cells.js";

export type ResourceOverviewStandardIconStyle = CSSProperties & {
  [property: `--${string}`]: string | number | undefined;
};

export interface ResourceOverviewStandardNameCellProps {
  title: string;
  description?: ReactNode;
  icon: ReactNode;
  iconClassName?: string;
  iconStyle?: ResourceOverviewStandardIconStyle;
  className?: string;
}

export interface ResourceOverviewStandardCreatorCellProps {
  name?: string | null;
  avatarUrl?: string | null;
  fallback?: string | null;
}

function getIdentityFallback(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

/** Canonical Knowledge-style Name cell for catalog overview tables. */
export function ResourceOverviewStandardNameCell({
  title,
  description,
  icon,
  iconClassName = "",
  iconStyle,
  className = "",
}: ResourceOverviewStandardNameCellProps) {
  return (
    <ResourceOverviewCatalogIdentityCell
      title={title}
      description={description}
      icon={icon}
      iconClassName={`is-standard-name${iconClassName ? ` ${iconClassName}` : ""}`}
      iconStyle={iconStyle}
      className={`resource-overview-standard-name-cell${className ? ` ${className}` : ""}`}
    />
  );
}

/** Canonical Knowledge-style Creator cell with a circular, unframed avatar. */
export function ResourceOverviewStandardCreatorCell({
  name,
  avatarUrl,
  fallback,
}: ResourceOverviewStandardCreatorCellProps) {
  const creatorName = name?.trim() || "Unknown";
  return (
    <ResourceOverviewIdentityCell
      title={creatorName}
      imageUrl={avatarUrl || undefined}
      fallback={fallback?.trim() || getIdentityFallback(creatorName)}
      iconClassName="is-creator is-standard-creator"
      className="resource-overview-standard-creator-cell"
    />
  );
}

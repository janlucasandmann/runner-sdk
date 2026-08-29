import type { CSSProperties, ReactNode } from "react";
import type { PlatformDataTableColumn } from "../../components/composite/data-table/index.js";
import {
  ResourceOverviewCatalogIdentityCell,
  ResourceOverviewIdentityCell,
  ResourceOverviewValue,
} from "./resource-overview-cells.js";

export type ResourceOverviewUpdatedAt = Date | number | string | null | undefined;
export type ResourceOverviewIconStyle = CSSProperties & {
  [property: `--${string}`]: string | number | undefined;
};

export interface ResourceOverviewStandardRow {
  name: string;
  description?: ReactNode;
  creatorName?: string | null;
  creatorAvatarUrl?: string | null;
  creatorFallback?: string | null;
  updatedAt?: ResourceOverviewUpdatedAt;
}

export interface ResourceOverviewNameVisual {
  icon: ReactNode;
  iconClassName?: string;
  iconStyle?: ResourceOverviewIconStyle;
}

export interface ResourceOverviewColumnExtensions<TData> {
  beforeName?: readonly PlatformDataTableColumn<TData>[];
  afterName?: readonly PlatformDataTableColumn<TData>[];
  afterCreator?: readonly PlatformDataTableColumn<TData>[];
  afterUpdated?: readonly PlatformDataTableColumn<TData>[];
}

export interface CreateResourceOverviewColumnsOptions<
  TData extends ResourceOverviewStandardRow,
> {
  name: {
    getVisual: (row: TData) => ResourceOverviewNameVisual;
    className?: string;
  };
  extensions?: ResourceOverviewColumnExtensions<TData>;
}

function getIdentityFallback(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function getUpdatedTimestamp(value: ResourceOverviewUpdatedAt): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  return Date.parse(String(value || ""));
}

export function formatResourceOverviewUpdatedAt(
  value: ResourceOverviewUpdatedAt,
): string {
  const timestamp = getUpdatedTimestamp(value);
  if (!Number.isFinite(timestamp) || timestamp <= 0) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(timestamp),
  );
}

/**
 * Canonical catalog columns shared by resource overview pages. The baseline
 * columns are deliberately fixed; consumers can add domain columns only via
 * extension slots, which preserves Name, Creator, and Updated everywhere.
 */
export function createResourceOverviewColumns<
  TData extends ResourceOverviewStandardRow,
>({
  name,
  extensions = {},
}: CreateResourceOverviewColumnsOptions<TData>): PlatformDataTableColumn<TData>[] {
  const nameColumn: PlatformDataTableColumn<TData> = {
    id: "name",
    header: "Name",
    accessor: (row) => row.name,
    sortable: true,
    width: "minmax(320px, 1.5fr)",
    cell: ({ row }) => {
      const visual = name.getVisual(row);
      return (
        <ResourceOverviewCatalogIdentityCell
          title={row.name}
          description={row.description}
          icon={visual.icon}
          iconClassName={visual.iconClassName}
          iconStyle={visual.iconStyle}
          className={name.className}
        />
      );
    },
  };
  const creatorColumn: PlatformDataTableColumn<TData> = {
    id: "creator",
    header: "Creator",
    accessor: (row) => row.creatorName || "Unknown",
    sortable: true,
    width: "minmax(160px, 0.65fr)",
    cell: ({ row }) => {
      const creatorName = row.creatorName?.trim() || "Unknown";
      return (
        <ResourceOverviewIdentityCell
          title={creatorName}
          imageUrl={row.creatorAvatarUrl || undefined}
          fallback={row.creatorFallback?.trim() || getIdentityFallback(creatorName)}
          iconClassName="is-creator"
        />
      );
    },
  };
  const updatedColumn: PlatformDataTableColumn<TData> = {
    id: "updated",
    header: "Updated",
    accessor: (row) => getUpdatedTimestamp(row.updatedAt),
    sortable: true,
    sortDescFirst: true,
    width: "minmax(140px, 0.55fr)",
    cell: ({ row }) => (
      <ResourceOverviewValue>
        {formatResourceOverviewUpdatedAt(row.updatedAt)}
      </ResourceOverviewValue>
    ),
  };

  return [
    ...(extensions.beforeName || []),
    nameColumn,
    ...(extensions.afterName || []),
    creatorColumn,
    ...(extensions.afterCreator || []),
    updatedColumn,
    ...(extensions.afterUpdated || []),
  ];
}

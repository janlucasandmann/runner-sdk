import type { ReactNode } from "react";
import type { PlatformDataTableColumn } from "../../components/composite/data-table/index.js";
import {
  formatPlatformResourceUpdatedAt,
  getPlatformResourceUpdatedTimestamp,
  type PlatformResourceUpdatedAt,
} from "../../formatting/index.js";
import { ResourceOverviewValue } from "./resource-overview-cells.js";
import {
  ResourceOverviewStandardCreatorCell,
  type ResourceOverviewStandardIconStyle,
  ResourceOverviewStandardNameCell,
} from "./resource-overview-standard-cells.js";

export type ResourceOverviewUpdatedAt = PlatformResourceUpdatedAt;
export type ResourceOverviewIconStyle = ResourceOverviewStandardIconStyle;

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

export interface ResourceOverviewCreatorResolver<TData> {
  getName?: (row: TData) => string | null | undefined;
  getAvatarUrl?: (row: TData) => string | null | undefined;
  getFallback?: (row: TData) => string | null | undefined;
}

export interface CreateResourceOverviewColumnsOptions<TData extends ResourceOverviewStandardRow> {
  name: {
    getVisual: (row: TData) => ResourceOverviewNameVisual;
    className?: string;
  };
  creator?: ResourceOverviewCreatorResolver<TData>;
  extensions?: ResourceOverviewColumnExtensions<TData>;
}

export function formatResourceOverviewUpdatedAt(value: ResourceOverviewUpdatedAt): string {
  return formatPlatformResourceUpdatedAt(value);
}

/**
 * Canonical catalog columns shared by resource overview pages. The baseline
 * columns are deliberately fixed; consumers can add domain columns only via
 * extension slots, which preserves Name, Creator, and Updated everywhere.
 */
export function createResourceOverviewColumns<TData extends ResourceOverviewStandardRow>({
  name,
  creator,
  extensions = {},
}: CreateResourceOverviewColumnsOptions<TData>): PlatformDataTableColumn<TData>[] {
  const getCreatorName = (row: TData) => creator?.getName?.(row) ?? row.creatorName;
  const getCreatorAvatarUrl = (row: TData) => (
    creator?.getAvatarUrl?.(row) ?? row.creatorAvatarUrl
  );
  const getCreatorFallback = (row: TData) => (
    creator?.getFallback?.(row) ?? row.creatorFallback
  );
  const nameColumn: PlatformDataTableColumn<TData> = {
    id: "name",
    header: "Name",
    accessor: (row) => row.name,
    sortable: true,
    width: "minmax(320px, 1.5fr)",
    cell: ({ row }) => {
      const visual = name.getVisual(row);
      return (
        <ResourceOverviewStandardNameCell
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
    accessor: (row) => getCreatorName(row)?.trim() || "Unknown",
    sortable: true,
    width: "minmax(160px, 0.65fr)",
    cell: ({ row }) => (
      <ResourceOverviewStandardCreatorCell
        name={getCreatorName(row)}
        avatarUrl={getCreatorAvatarUrl(row)}
        fallback={getCreatorFallback(row)}
      />
    ),
  };
  const updatedColumn: PlatformDataTableColumn<TData> = {
    id: "updated",
    header: "Updated",
    accessor: (row) => getPlatformResourceUpdatedTimestamp(row.updatedAt),
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

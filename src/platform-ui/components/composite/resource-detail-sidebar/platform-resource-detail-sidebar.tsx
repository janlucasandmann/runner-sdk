import type { ReactNode } from "react";
import {
  PlatformOwnerSelector,
  type PlatformOwnerIdentity,
  type PlatformOwnerOption,
  type PlatformOwnerSelectorProps,
} from "../owner-selector/index.js";
import { PlatformUiCard } from "../ui-card/index.js";

export interface PlatformResourceDetailSidebarAttribute {
  id?: string;
  label: ReactNode;
  value: ReactNode;
  title?: string;
  className?: string;
  hidden?: boolean;
}

export type PlatformResourceDetailSidebarOwnerSelectorProps<
  TValue extends string = string,
  TData = unknown,
> = Omit<
  PlatformOwnerSelectorProps<TValue, TData>,
  "owner" | "options" | "onTransfer"
>;

export interface PlatformResourceDetailSidebarProps<
  TValue extends string = string,
  TData = unknown,
> {
  attributes?: readonly PlatformResourceDetailSidebarAttribute[];
  creator?: PlatformOwnerIdentity;
  owner?: PlatformOwnerIdentity<TValue>;
  ownerOptions?: readonly PlatformOwnerOption<TValue, TData>[];
  onOwnerTransfer?: (
    value: TValue,
    option: PlatformOwnerOption<TValue, TData>,
  ) => void | Promise<void>;
  ownerSelectorProps?: PlatformResourceDetailSidebarOwnerSelectorProps<TValue, TData>;
  additionalAttributes?: readonly PlatformResourceDetailSidebarAttribute[];
  additionalLabel?: ReactNode;
  additionalDefaultExpanded?: boolean;
  primaryAction?: ReactNode;
  children?: ReactNode;
  className?: string;
  propertiesClassName?: string;
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

function getInitials(identity: PlatformOwnerIdentity) {
  const label = String(identity.name || identity.email || "User").trim();
  const parts = label.split(/\s+/).filter(Boolean);
  return (parts.length > 1
    ? `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`
    : label.slice(0, 2)
  ).toUpperCase() || "U";
}

function ResourceIdentity({ identity }: { identity: PlatformOwnerIdentity }) {
  const label = String(identity.name || identity.email || "Unknown user").trim()
    || "Unknown user";
  return (
    <span
      className="platform-resource-detail-sidebar__identity"
      title={identity.email ? `${label} · ${identity.email}` : label}
    >
      <span className="platform-resource-detail-sidebar__avatar" aria-hidden="true">
        {identity.avatarUrl ? <img src={identity.avatarUrl} alt="" /> : getInitials(identity)}
      </span>
      <span className="platform-resource-detail-sidebar__identity-name">{label}</span>
    </span>
  );
}

function Property({
  attribute,
}: {
  attribute: PlatformResourceDetailSidebarAttribute;
}) {
  return (
    <div
      className={joinClassNames(
        "platform-service-detail-page__property",
        "playground-tasks-detail-fact",
        attribute.className,
      )}
      title={attribute.title}
    >
      <span className="platform-service-detail-page__property-label">
        {attribute.label}
      </span>
      <div className="platform-service-detail-page__property-value">
        {attribute.value}
      </div>
    </div>
  );
}

function renderAttributes(
  attributes: readonly PlatformResourceDetailSidebarAttribute[] = [],
) {
  return attributes
    .filter((attribute) => !attribute.hidden)
    .map((attribute, index) => (
      <Property
        key={attribute.id || `property-${index}`}
        attribute={attribute}
      />
    ));
}

/**
 * Shared properties sidebar for resource detail pages.
 *
 * Resource-specific attributes can be supplied directly or in the optional
 * expandable section. Ownership is deliberately handled here so every
 * resource gets the same selector and irreversible-transfer confirmation.
 */
export function PlatformResourceDetailSidebar<
  TValue extends string = string,
  TData = unknown,
>({
  attributes = [],
  creator,
  owner,
  ownerOptions = [],
  onOwnerTransfer,
  ownerSelectorProps,
  additionalAttributes = [],
  additionalLabel = "More details",
  additionalDefaultExpanded = false,
  primaryAction,
  children,
  className = "",
  propertiesClassName = "",
}: PlatformResourceDetailSidebarProps<TValue, TData>) {
  const ownerSelector = owner && onOwnerTransfer ? (
    <PlatformOwnerSelector
      owner={owner}
      options={ownerOptions}
      onTransfer={onOwnerTransfer}
      {...ownerSelectorProps}
      className={joinClassNames(
        "platform-resource-detail-sidebar__owner-selector",
        ownerSelectorProps?.className,
      )}
    />
  ) : owner ? <ResourceIdentity identity={owner} /> : null;

  const properties = [
    ...renderAttributes(attributes),
    creator ? (
      <Property
        key="creator"
        attribute={{
          id: "creator",
          label: "Creator",
          value: <ResourceIdentity identity={creator} />,
          className: "platform-resource-detail-sidebar__creator-row",
          title: creator.email || creator.name,
        }}
      />
    ) : null,
    owner ? (
      <Property
        key="owner"
        attribute={{
          id: "owner",
          label: "Owner",
          value: ownerSelector,
          className: "platform-resource-detail-sidebar__owner-row",
          title: owner.email || owner.name,
        }}
      />
    ) : null,
  ].filter(Boolean);

  return (
    <PlatformUiCard
      as="section"
      variant="sidebar"
      cardTitle={undefined}
      className={joinClassNames("platform-resource-detail-sidebar", className)}
    >
      <div
        className={joinClassNames(
          "platform-service-detail-page__property-list",
          "playground-tasks-detail-facts-body",
          "platform-resource-detail-sidebar__properties",
          propertiesClassName,
        )}
      >
        {properties}
        {additionalAttributes.length > 0 ? (
          <details
            className="platform-resource-detail-sidebar__additional"
            open={additionalDefaultExpanded || undefined}
          >
            <summary>{additionalLabel}</summary>
            <div className="platform-resource-detail-sidebar__additional-properties">
              {renderAttributes(additionalAttributes)}
            </div>
          </details>
        ) : null}
        {children}
        {primaryAction}
      </div>
    </PlatformUiCard>
  );
}

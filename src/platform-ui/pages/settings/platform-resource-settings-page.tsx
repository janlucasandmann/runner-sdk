import type { CSSProperties, ReactNode, Ref } from "react";

import { PlatformDetailSidebar } from "../../components/composite/detail-sidebar/index.js";
import {
  PlatformResourceDetailSidebar,
  type PlatformResourceDetailSidebarProps,
  PlatformResourceSettingsDetailsSidebar,
  type PlatformResourceSettingsDetailsSidebarProps,
} from "../../components/composite/resource-detail-sidebar/index.js";

export interface PlatformResourceSettingsIdentityProps {
  icon: ReactNode;
  title: string;
  description: string;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
  onTitleBlur?: (title: string) => void;
  onDescriptionBlur?: (description: string) => void;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
  titleAriaLabel?: string;
  descriptionAriaLabel?: string;
  titleRef?: Ref<HTMLTextAreaElement>;
  readOnly?: boolean;
  trailing?: ReactNode;
  className?: string;
  iconClassName?: string;
  iconStyle?: CSSProperties;
  iconAriaHidden?: boolean;
}

export interface PlatformResourceSettingsPageProps<
  TValue extends string = string,
  TData = unknown,
> {
  identity: PlatformResourceSettingsIdentityProps;
  details:
    | (PlatformResourceSettingsDetailsSidebarProps<TValue, TData> & {
        variant: "standard";
      })
    | (PlatformResourceDetailSidebarProps<TValue, TData> & {
        /** @deprecated Migrate Settings pages to the standard details contract. */
        variant?: "legacy";
      });
  access: ReactNode;
  location?: ReactNode;
  connectors?: ReactNode;
  additionalSections?: ReactNode;
  accessDetailOpen?: boolean;
  detailsSidebarCollapsed?: boolean;
  ariaLabel?: string;
  detailsSidebarAriaLabel?: string;
  className?: string;
  mainClassName?: string;
  sectionsClassName?: string;
  detailsSidebarClassName?: string;
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

function normalizeResourceTitle(value: string) {
  return value.replace(/[\r\n]+/g, " ");
}

/**
 * Canonical editable identity header for a resource Settings tab.
 *
 * Titles remain one logical value while wrapping visually across as many lines
 * as the available width requires. Descriptions support both wrapping and
 * intentional line breaks.
 */
export function PlatformResourceSettingsIdentity({
  icon,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onTitleBlur,
  onDescriptionBlur,
  titlePlaceholder = "Resource name",
  descriptionPlaceholder = "Describe this resource",
  titleAriaLabel = "Resource name",
  descriptionAriaLabel = "Resource description",
  titleRef,
  readOnly = false,
  trailing,
  className = "",
  iconClassName = "",
  iconStyle,
  iconAriaHidden = true,
}: PlatformResourceSettingsIdentityProps) {
  const titleReadOnly = readOnly || !onTitleChange;
  const descriptionReadOnly = readOnly || !onDescriptionChange;

  return (
    <header
      className={joinClassNames(
        "platform-service-detail-identity",
        "platform-resource-settings-identity",
        className,
      )}
      data-platform-resource-settings-identity="true"
    >
      <span
        className={joinClassNames(
          "platform-service-detail-identity__avatar",
          "platform-resource-settings-identity__icon",
          iconClassName,
        )}
        style={iconStyle}
        aria-hidden={iconAriaHidden}
      >
        {icon}
      </span>
      <div
        className={joinClassNames(
          "platform-service-detail-identity__copy",
          "platform-resource-settings-identity__copy",
        )}
      >
        <textarea
          ref={titleRef}
          className={joinClassNames(
            "platform-service-detail-identity__title-input",
            "platform-resource-settings-identity__title-input",
          )}
          value={title}
          rows={1}
          readOnly={titleReadOnly}
          placeholder={titlePlaceholder}
          aria-label={titleAriaLabel}
          onChange={(event) => {
            onTitleChange?.(normalizeResourceTitle(event.currentTarget.value));
          }}
          onBlur={(event) => onTitleBlur?.(normalizeResourceTitle(event.currentTarget.value))}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.nativeEvent.isComposing) {
              event.preventDefault();
            }
          }}
        />
        <textarea
          className={joinClassNames(
            "platform-service-detail-identity__description-input",
            "platform-resource-settings-identity__description-input",
          )}
          value={description}
          rows={1}
          readOnly={descriptionReadOnly}
          placeholder={descriptionPlaceholder}
          aria-label={descriptionAriaLabel}
          onChange={(event) => onDescriptionChange?.(event.currentTarget.value)}
          onBlur={(event) => onDescriptionBlur?.(event.currentTarget.value)}
        />
      </div>
      {trailing ? (
        <div className="platform-resource-settings-identity__trailing">{trailing}</div>
      ) : null}
    </header>
  );
}

function SettingsSlot({
  name,
  children,
}: {
  name: "location" | "connectors" | "additional" | "access";
  children: ReactNode;
}) {
  return (
    <div
      className={`platform-resource-settings-page__slot is-${name}`}
      data-platform-resource-settings-slot={name}
    >
      {children}
    </div>
  );
}

/**
 * Canonical composition for resource Settings tabs.
 *
 * Every resource supplies an identity, the shared details-sidebar contract,
 * and Access. Location and Connectors are ordered optional slots; additional
 * domain sections render after them and before Access.
 */
export function PlatformResourceSettingsPage<TValue extends string = string, TData = unknown>({
  identity,
  details,
  access,
  location,
  connectors,
  additionalSections,
  accessDetailOpen = false,
  detailsSidebarCollapsed = false,
  ariaLabel = "Resource settings",
  detailsSidebarAriaLabel = "Resource details",
  className = "",
  mainClassName = "",
  sectionsClassName = "",
  detailsSidebarClassName = "",
}: PlatformResourceSettingsPageProps<TValue, TData>) {
  const sidebarCollapsed = accessDetailOpen || detailsSidebarCollapsed;
  return (
    <section
      className={joinClassNames(
        "platform-resource-settings-page",
        accessDetailOpen && "is-access-detail-open",
        sidebarCollapsed && "is-details-sidebar-collapsed",
        className,
      )}
      aria-label={ariaLabel}
      data-platform-resource-settings-page="true"
      data-access-detail-open={accessDetailOpen ? "true" : "false"}
    >
      <div className={joinClassNames("platform-resource-settings-page__main", mainClassName)}>
        <PlatformResourceSettingsIdentity {...identity} />
        <div
          className={joinClassNames("platform-resource-settings-page__sections", sectionsClassName)}
        >
          {!accessDetailOpen && location ? (
            <SettingsSlot name="location">{location}</SettingsSlot>
          ) : null}
          {!accessDetailOpen && connectors ? (
            <SettingsSlot name="connectors">{connectors}</SettingsSlot>
          ) : null}
          {!accessDetailOpen && additionalSections ? (
            <SettingsSlot name="additional">{additionalSections}</SettingsSlot>
          ) : null}
          <SettingsSlot name="access">{access}</SettingsSlot>
        </div>
      </div>

      {!accessDetailOpen ? (
        <PlatformDetailSidebar
          collapsed={detailsSidebarCollapsed}
          ariaLabel={detailsSidebarAriaLabel}
          className={joinClassNames(
            "platform-resource-settings-page__sidebar",
            detailsSidebarClassName,
          )}
        >
          {details.variant === "standard" ? (
            <PlatformResourceSettingsDetailsSidebar<TValue, TData> {...details} />
          ) : (
            <PlatformResourceDetailSidebar<TValue, TData> {...details} />
          )}
        </PlatformDetailSidebar>
      ) : null}
    </section>
  );
}

import type { ReactNode } from "react";
import { PlatformUiCard } from "../../components/composite/ui-card/index.js";
import {
  PlatformResourceSettingsPage,
  type PlatformResourceSettingsPageProps,
} from "../settings/index.js";
import { ResourceDetailPage } from "./resource-detail-page.js";

export type PlatformServiceDetailVariant = "resource" | "run";

export interface PlatformServiceDetailPageProps<
  TValue extends string = string,
  TData = unknown,
> {
  children: ReactNode;
  settings?: PlatformResourceSettingsPageProps<TValue, TData>;
  properties?: ReactNode;
  actions?: ReactNode;
  sidebarContent?: ReactNode;
  sidebarCollapsed?: boolean;
  sidebarPopoverOpen?: boolean;
  ariaLabel?: string;
  sidebarAriaLabel?: string;
  className?: string;
  contentClassName?: string;
  sidebarClassName?: string;
  propertiesCardClassName?: string;
  actionsCardClassName?: string;
  variant?: PlatformServiceDetailVariant;
}

export interface PlatformServiceDetailFrameProps {
  children: ReactNode;
  className?: string;
}

export interface PlatformServiceDetailPropertyListProps {
  children: ReactNode;
  className?: string;
}

export interface PlatformServiceDetailPropertyProps {
  label: ReactNode;
  children: ReactNode;
  className?: string;
  title?: string;
}

function joinClassNames(
  ...classNames: Array<string | false | null | undefined>
): string {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

export function PlatformServiceDetailFrame({
  children,
  className = "",
}: PlatformServiceDetailFrameProps) {
  return (
    <div
      className={joinClassNames("platform-service-detail-frame", className)}
      data-platform-service-detail-frame="true"
    >
      {children}
    </div>
  );
}

export function PlatformServiceDetailPropertyList({
  children,
  className = "",
}: PlatformServiceDetailPropertyListProps) {
  return (
    <div
      className={joinClassNames(
        "platform-service-detail-page__property-list",
        "playground-tasks-detail-facts-body",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PlatformServiceDetailProperty({
  label,
  children,
  className = "",
  title,
}: PlatformServiceDetailPropertyProps) {
  return (
    <div
      className={joinClassNames(
        "platform-service-detail-page__property",
        "playground-tasks-detail-fact",
        className,
      )}
    >
      <span className="platform-service-detail-page__property-label">
        {label}
      </span>
      <div
        className="platform-service-detail-page__property-value"
        title={title}
      >
        {children}
      </div>
    </div>
  );
}

export function PlatformServiceDetailPage<
  TValue extends string = string,
  TData = unknown,
>({
  children,
  settings,
  properties,
  actions,
  sidebarContent,
  sidebarCollapsed = false,
  sidebarPopoverOpen = false,
  ariaLabel = "Service details",
  sidebarAriaLabel = "Service information and actions",
  className = "",
  contentClassName = "",
  sidebarClassName = "",
  propertiesCardClassName = "",
  actionsCardClassName = "",
  variant = "resource",
}: PlatformServiceDetailPageProps<TValue, TData>) {
  const isRun = variant === "run";
  const hasResourceSettings = Boolean(settings);
  const resolvedSidebar = hasResourceSettings ? null : sidebarContent === undefined ? (
    <>
      <PlatformUiCard
        as="section"
        variant="sidebar"
        className={joinClassNames(
          "playground-ticket-detail-sidebar-section",
          "playground-ticket-detail-sidebar-details",
          "platform-service-detail-page__sidebar-card",
          propertiesCardClassName,
        )}
      >
        {properties}
      </PlatformUiCard>
      {actions !== undefined && actions !== null ? (
        <PlatformUiCard
          as="section"
          variant="sidebar"
          cardTitle="Actions"
          className={joinClassNames(
            "platform-service-detail-page__sidebar-card",
            actionsCardClassName,
          )}
        >
          {actions}
        </PlatformUiCard>
      ) : null}
    </>
  ) : sidebarContent;

  return (
    <ResourceDetailPage
      tabs={[]}
      sidebarCollapsed={!hasResourceSettings && sidebarCollapsed}
      sidebar={resolvedSidebar}
      ariaLabel={ariaLabel}
      tabAriaLabel={isRun ? "Run sections" : "Service sections"}
      sidebarAriaLabel={sidebarAriaLabel}
      className={joinClassNames(
        "playground-project-overview-layout",
        "playground-agents-detail-overview-layout",
        "platform-service-detail-page",
        isRun && "is-run-detail",
        hasResourceSettings && "has-resource-settings",
        className,
      )}
      headerClassName="platform-service-detail-page__header"
      contentClassName={joinClassNames(
        "playground-project-overview-main",
        "playground-agents-detail-overview-main",
        "platform-service-detail-page__main",
        contentClassName,
      )}
      sidebarClassName={joinClassNames(
        "playground-project-overview-sidebar",
        "playground-agents-detail-sidebar",
        "platform-service-detail-page__sidebar",
        sidebarPopoverOpen && "is-popover-open",
        sidebarClassName,
      )}
    >
      {settings ? <PlatformResourceSettingsPage {...settings} /> : children}
    </ResourceDetailPage>
  );
}

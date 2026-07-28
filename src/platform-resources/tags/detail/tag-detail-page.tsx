import { CheckCircle2, Plug, Plus, Unplug } from "lucide-react";
import type { ReactNode } from "react";
import { PlatformEmptyState } from "../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformLoadingState } from "../../../platform-ui/components/composite/loading-state/index.js";
import { PlatformUiCard } from "../../../platform-ui/components/composite/ui-card/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../platform-ui/components/ui/button/index.js";
import { ResourceDetailPage } from "../../../platform-ui/pages/details/index.js";

export type TagDetailTab = "overview" | "authentication" | "permissions";

export interface TagDetailConnectionAction {
  label: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "primary" | "secondary" | "destructive";
}

export interface TagDetailInformationRow {
  id: string;
  label: ReactNode;
  value: ReactNode;
}

export interface TagDetailIncludedItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
}

export interface TagDetailPageProps {
  identityIcon?: ReactNode;
  identityTitle: ReactNode;
  identityDescription?: ReactNode;
  connectionAction?: TagDetailConnectionAction | null;
  tabBarActions?: ReactNode;
  sidebarToggle?: ReactNode;
  children: ReactNode;
  authentication?: ReactNode;
  authenticationConnected?: boolean;
  authenticationLoading?: boolean;
  authenticationIdentity?: ReactNode;
  authenticationMethod?: ReactNode;
  authenticationTitle?: ReactNode;
  authenticationEmptyTitle?: ReactNode;
  authenticationEmptyDescription?: ReactNode;
  overviewInformation?: readonly TagDetailInformationRow[];
  overviewIncludedItems?: readonly TagDetailIncludedItem[];
  sidebar?: ReactNode;
  activeTab: TagDetailTab;
  onTabChange: (tab: TagDetailTab) => void;
  sidebarCollapsed?: boolean;
  sidebarPopoverOpen?: boolean;
  permissions?: ReactNode;
  ariaLabel?: string;
  sidebarAriaLabel?: string;
  className?: string;
}

const TAG_DETAIL_TABS = [
  { id: "overview", label: "Overview" },
  { id: "authentication", label: "Authentication" },
  { id: "permissions", label: "Permissions" },
] as const;

const TAG_DETAIL_SIDEBAR_AUTO_COLLAPSE_TABS = ["authentication", "permissions"] as const;

function ConnectionButton({
  action,
  className = "",
}: {
  action: TagDetailConnectionAction;
  className?: string;
}) {
  const isPrimary = (action.tone || "primary") === "primary";
  const Button = isPrimary ? PlatformPrimaryButton : PlatformSecondaryButton;
  const Icon = isPrimary ? Plus : Unplug;

  return (
    <Button
      type="button"
      size="small"
      className={`tag-detail-page__connection-action${action.tone === "destructive" ? " is-destructive" : ""}${className ? ` ${className}` : ""}`}
      onClick={action.onClick}
      disabled={action.disabled}
    >
      <Icon width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
      <span>{action.label}</span>
    </Button>
  );
}

function TagDetailIdentity({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="tag-detail-page__identity">
      {icon ? <div className="tag-detail-page__identity-icon">{icon}</div> : null}
      <div className="tag-detail-page__identity-copy">
        <h1 className="tag-detail-page__identity-title">{title}</h1>
        {description ? (
          <p className="tag-detail-page__identity-description">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

function AuthenticationSummary({ identity, method }: { identity?: ReactNode; method?: ReactNode }) {
  return (
    <div className="tag-detail-page__authentication-summary">
      <CheckCircle2
        className="tag-detail-page__authentication-connected-icon"
        width={22}
        height={22}
        strokeWidth={1.7}
        aria-hidden="true"
      />
      <div className="tag-detail-page__authentication-summary-copy">
        <div className="tag-detail-page__authentication-summary-title">
          Authentication connected
        </div>
        <div className="tag-detail-page__authentication-summary-description">
          This connector can use its authenticated actions and protected data.
        </div>
      </div>
      <dl className="tag-detail-page__authentication-facts">
        {identity ? (
          <div className="tag-detail-page__authentication-fact">
            <dt>Connected identity</dt>
            <dd>{identity}</dd>
          </div>
        ) : null}
        {method ? (
          <div className="tag-detail-page__authentication-fact">
            <dt>Authentication</dt>
            <dd>{method}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

function TagAuthenticationView({
  title,
  content,
  connected,
  loading,
  identity,
  method,
  emptyTitle,
  emptyDescription,
  connectionAction,
}: {
  title: ReactNode;
  content?: ReactNode;
  connected: boolean;
  loading: boolean;
  identity?: ReactNode;
  method?: ReactNode;
  emptyTitle: ReactNode;
  emptyDescription: ReactNode;
  connectionAction?: TagDetailConnectionAction | null;
}) {
  return (
    <section className="tag-detail-page__authentication" aria-label="Connector authentication">
      <h2 className="tag-detail-page__section-title">{title}</h2>
      <PlatformUiCard
        as="section"
        className={`tag-detail-page__authentication-surface${content ? " has-custom-content" : ""}`}
      >
        {loading ? (
          <PlatformLoadingState centered message="Loading authentication..." />
        ) : content ? (
          <div className="tag-detail-page__authentication-content">{content}</div>
        ) : connected ? (
          <AuthenticationSummary identity={identity} method={method} />
        ) : (
          <PlatformEmptyState
            icon={Plug}
            iconSize={28}
            title={emptyTitle}
            description={emptyDescription}
            primaryAction={
              connectionAction
                ? {
                    label: connectionAction.label,
                    onClick: connectionAction.onClick,
                    disabled: connectionAction.disabled,
                    icon: Plus,
                    ariaLabel: "Connect authentication",
                  }
                : undefined
            }
            className="tag-detail-page__authentication-empty"
          />
        )}
      </PlatformUiCard>
    </section>
  );
}

function TagOverviewView({
  information,
  includedItems,
  connected,
  connectionAction,
  children,
}: {
  information: readonly TagDetailInformationRow[];
  includedItems: readonly TagDetailIncludedItem[];
  connected: boolean;
  connectionAction?: TagDetailConnectionAction | null;
  children: ReactNode;
}) {
  const hasInformation = information.length > 0;
  const hasIncludedItems = includedItems.length > 0;

  return (
    <div className="tag-detail-page__overview">
      {hasInformation || hasIncludedItems ? (
        <PlatformUiCard as="section" className="tag-detail-page__information-surface">
          {hasInformation ? (
            <>
              <h2 className="tag-detail-page__section-title">Information</h2>
              <dl className="tag-detail-page__information-list">
                {information.map((row) => (
                  <div className="tag-detail-page__information-row" key={row.id}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : null}

          {hasIncludedItems ? (
            <div className="tag-detail-page__included">
              <h2 className="tag-detail-page__section-title">Included actions</h2>
              {connected ? (
                <div className="tag-detail-page__included-list">
                  {includedItems.map((item) => (
                    <div className="tag-detail-page__included-item" key={item.id}>
                      {item.icon ? (
                        <span className="tag-detail-page__included-item-icon" aria-hidden="true">
                          {item.icon}
                        </span>
                      ) : null}
                      <div className="tag-detail-page__included-item-copy">
                        <div className="tag-detail-page__included-item-title">{item.title}</div>
                        {item.description ? (
                          <div className="tag-detail-page__included-item-description">
                            {item.description}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="tag-detail-page__connection-notice">
                  <div className="tag-detail-page__connection-notice-copy">
                    <div className="tag-detail-page__connection-notice-title">Not connected</div>
                    <div className="tag-detail-page__connection-notice-description">
                      Connect this integration to discover and use its available actions.
                    </div>
                  </div>
                  {connectionAction ? (
                    <ConnectionButton
                      action={connectionAction}
                      className="tag-detail-page__connection-notice-action"
                    />
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
        </PlatformUiCard>
      ) : null}

      {children}
    </div>
  );
}

export function TagDetailPage({
  identityIcon,
  identityTitle,
  identityDescription,
  connectionAction,
  tabBarActions,
  sidebarToggle,
  children,
  authentication,
  authenticationConnected = false,
  authenticationLoading = false,
  authenticationIdentity,
  authenticationMethod,
  authenticationTitle = "Authentication credentials",
  authenticationEmptyTitle = "No authentication yet",
  authenticationEmptyDescription = "Connect this integration to use its protected data and actions.",
  overviewInformation = [],
  overviewIncludedItems = [],
  sidebar,
  activeTab,
  onTabChange,
  sidebarCollapsed = false,
  sidebarPopoverOpen = false,
  permissions,
  ariaLabel = "Tag details",
  sidebarAriaLabel = "Tag settings",
  className = "",
}: TagDetailPageProps) {
  const activeContent =
    activeTab === "authentication" ? (
      <TagAuthenticationView
        title={authenticationTitle}
        content={authentication}
        connected={authenticationConnected}
        loading={authenticationLoading}
        identity={authenticationIdentity}
        method={authenticationMethod}
        emptyTitle={authenticationEmptyTitle}
        emptyDescription={authenticationEmptyDescription}
        connectionAction={connectionAction}
      />
    ) : activeTab === "permissions" && permissions ? (
      <section
        className="playground-agents-permissions-section playground-tags-detail-permissions-section"
        data-section-id="permissions"
      >
        {permissions}
      </section>
    ) : (
      <TagOverviewView
        information={overviewInformation}
        includedItems={overviewIncludedItems}
        connected={authenticationConnected}
        connectionAction={connectionAction}
      >
        {children}
      </TagOverviewView>
    );

  return (
    <ResourceDetailPage<TagDetailTab>
      header={
        <TagDetailIdentity
          icon={identityIcon}
          title={identityTitle}
          description={identityDescription}
        />
      }
      headerActions={connectionAction ? <ConnectionButton action={connectionAction} /> : undefined}
      tabs={TAG_DETAIL_TABS}
      activeTab={activeTab}
      onTabChange={onTabChange}
      tabBarActions={tabBarActions}
      sidebarToggle={sidebarToggle}
      sidebar={sidebar}
      sidebarCollapsed={sidebarCollapsed}
      sidebarAutoCollapseTabs={TAG_DETAIL_SIDEBAR_AUTO_COLLAPSE_TABS}
      ariaLabel={ariaLabel}
      tabAriaLabel="Connector sections"
      sidebarAriaLabel={sidebarAriaLabel}
      className={`playground-server-detail-page playground-tag-plugin-detail-page playground-project-overview-layout playground-agents-detail-overview-layout playground-tags-detail-overview-layout${className ? ` ${className}` : ""}`}
      headerClassName="tag-detail-page__header"
      tabBarClassName="tag-detail-page__tabs playground-plugin-detail-tabs playground-tags-detail-tabs"
      tabBarActionsClassName="playground-agents-detail-tab-actions playground-tags-detail-tab-actions"
      contentClassName={`playground-server-detail-page__content playground-tag-plugin-detail-content playground-project-overview-main playground-agents-detail-overview-main playground-tags-detail-overview-main is-${activeTab}-tab`}
      sidebarClassName={`playground-project-overview-sidebar playground-agents-detail-sidebar playground-server-detail-sidebar playground-tags-detail-sidebar${sidebarPopoverOpen ? " is-popover-open" : ""}`}
    >
      {activeContent}
    </ResourceDetailPage>
  );
}

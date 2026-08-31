import {
  ChevronDown,
  ChevronRight,
  Copy,
  EllipsisVertical,
  Key,
  Plug,
  Plus,
  Unplug,
} from "../../../platform-ui/components/ui/hugeicons-compat.js";
import {
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { PlatformEmptyState } from "../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformLoadingState } from "../../../platform-ui/components/composite/loading-state/index.js";
import { PlatformModal } from "../../../platform-ui/components/composite/modal/index.js";
import { PlatformPopup } from "../../../platform-ui/components/composite/popup/index.js";
import { PlatformUiCard } from "../../../platform-ui/components/composite/ui-card/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../platform-ui/components/ui/button/index.js";
import { PlatformIconButton } from "../../../platform-ui/components/ui/icon-button/index.js";
import { PlatformLabel } from "../../../platform-ui/components/ui/label/index.js";
import { PlatformSelector } from "../../../platform-ui/components/ui/selector/index.js";
import { ResourceDetailPage } from "../../../platform-ui/pages/details/index.js";
import {
  normalizePlatformConnectionCredentials,
  type PlatformConnectionCredential,
} from "../../shared/connections/connection-credentials.js";
import {
  ConnectionIdentityIcon,
  type ConnectionIdentityKind,
} from "../../shared/connections/connection-identity-icon.js";

export type TagDetailTab =
  | "overview"
  | "authentication"
  | "agent-triggers"
  | "permissions";

export interface TagDetailCredentialField {
  id: string;
  label: ReactNode;
  type?: "text" | "password" | "textarea" | "select";
  options?: readonly {
    value: string;
    label: ReactNode;
    description?: ReactNode;
  }[];
  placeholder?: string;
  description?: ReactNode;
  required?: boolean;
}

export interface TagDetailConnectionAction {
  label?: ReactNode;
  onClick: (
    credentialName?: string,
    values?: Readonly<Record<string, string>>,
  ) => void | Promise<void>;
  credentialFields?: readonly TagDetailCredentialField[];
  disabled?: boolean;
  tone?: "primary" | "secondary" | "destructive";
}

export interface TagDetailInformationRow {
  id: string;
  label: ReactNode;
  value: ReactNode;
  copyValue?: string;
  monospace?: boolean;
}

export interface TagDetailIncludedItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  access?: "interactive" | "read-only";
  inputSchema?: Readonly<Record<string, unknown>>;
}

export interface TagDetailPageProps {
  identityIcon?: ReactNode;
  identityKind?: ConnectionIdentityKind;
  identityId?: string;
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
  credentials?: readonly PlatformConnectionCredential[];
  onCredentialDisconnect?: (credentialId: string) => void | Promise<void>;
  authenticationTitle?: ReactNode;
  authenticationEmptyTitle?: ReactNode;
  authenticationEmptyDescription?: ReactNode;
  agentTriggers?: ReactNode;
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

function ConnectionButton({
  action,
  className = "",
  onClick,
}: {
  action: TagDetailConnectionAction;
  className?: string;
  onClick: () => void;
}) {
  return (
    <PlatformPrimaryButton
      type="button"
      size="small"
      className={`tag-detail-page__connection-action${className ? ` ${className}` : ""}`}
      onClick={onClick}
      disabled={action.disabled}
    >
      <Plus width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
      <span>Add Credentials</span>
    </PlatformPrimaryButton>
  );
}

function TagDetailIdentity({
  icon,
  kind,
  identityId,
  title,
  description,
}: {
  icon?: ReactNode;
  kind: ConnectionIdentityKind;
  identityId?: string;
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <div className="tag-detail-page__identity">
      <ConnectionIdentityIcon
        kind={kind}
        connectionId={identityId}
        icon={icon}
        variant="catalog"
        className="tag-detail-page__identity-icon"
      />
      <div className="tag-detail-page__identity-copy">
        <h1 className="tag-detail-page__identity-title">{title}</h1>
        {description ? (
          <p className="tag-detail-page__identity-description">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

function formatCredentialLastChecked(
  credential: PlatformConnectionCredential,
): string {
  if (credential.status === "pending") return "Authorization pending";
  if (!credential.lastCheckedAt) return "Not checked yet";
  const timestamp = Date.parse(credential.lastCheckedAt);
  if (!Number.isFinite(timestamp)) return "Last checked recently";
  const elapsedMs = Math.max(0, Date.now() - timestamp);
  if (elapsedMs < 60_000) return "Last checked just now";
  if (elapsedMs < 3_600_000) {
    return `Last checked ${Math.max(1, Math.round(elapsedMs / 60_000))}m ago`;
  }
  if (elapsedMs < 86_400_000) {
    return `Last checked ${Math.max(1, Math.round(elapsedMs / 3_600_000))}h ago`;
  }
  return `Last checked ${new Date(timestamp).toLocaleDateString()}`;
}

function CredentialRow({
  credential,
  onDisconnect,
}: {
  credential: PlatformConnectionCredential;
  onDisconnect?: (credentialId: string) => void | Promise<void>;
}) {
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const statusVariant =
    credential.status === "valid"
      ? "green"
      : credential.status === "invalid"
        ? "red"
        : "gray";
  const statusLabel =
    credential.status === "valid"
      ? "Valid"
      : credential.status === "invalid"
        ? "Invalid"
        : "Pending";

  const disconnect = async () => {
    if (!onDisconnect || disconnecting) return;
    setActionMenuOpen(false);
    setDisconnecting(true);
    try {
      await onDisconnect(credential.id);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <li className="tag-detail-page__credential-row">
      <div className="tag-detail-page__credential-identity">
        <span className="tag-detail-page__credential-icon" aria-hidden="true">
          <Key />
        </span>
        <span className="tag-detail-page__credential-copy">
          <span className="tag-detail-page__credential-name">
            {credential.name}
          </span>
          {credential.identity && credential.identity !== credential.name ? (
            <span className="tag-detail-page__credential-account">
              {credential.identity}
            </span>
          ) : null}
        </span>
        {credential.isDefault ? (
          <PlatformLabel variant="blue">Default</PlatformLabel>
        ) : null}
      </div>
      <div className="tag-detail-page__credential-method">
        {credential.method || "OAuth 2.0"}
      </div>
      <div className="tag-detail-page__credential-status">
        <PlatformLabel variant={statusVariant}>{statusLabel}</PlatformLabel>
        <span className="tag-detail-page__credential-checked">
          {formatCredentialLastChecked(credential)}
        </span>
      </div>
      {onDisconnect ? (
        <PlatformPopup
          open={actionMenuOpen}
          variant="minimal"
          placement="bottom-end"
          animation="down-in"
          rootClassName="tag-detail-page__credential-menu-anchor"
          rootProps={{
            onBlur: (event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setActionMenuOpen(false);
              }
            },
            onKeyDown: (event) => {
              if (event.key === "Escape") {
                setActionMenuOpen(false);
              }
            },
          }}
          surfaceClassName="tag-detail-page__credential-menu"
          surfaceProps={{ role: "menu", width: 180 }}
          trigger={({ open }) => (
            <PlatformIconButton
              type="button"
              size="compact"
              active={open}
              aria-label={`Credential actions for ${credential.name}`}
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setActionMenuOpen((current) => !current)}
            >
              <EllipsisVertical aria-hidden="true" />
            </PlatformIconButton>
          )}
        >
          <button
            type="button"
            role="menuitem"
            className="tb-popup-row"
            disabled={disconnecting}
            onClick={() => void disconnect()}
          >
            <Unplug className="tb-popup-icon" aria-hidden="true" />
            <span className="tb-popup-label">
              {disconnecting ? "Disconnecting..." : "Disconnect"}
            </span>
          </button>
        </PlatformPopup>
      ) : (
        <span
          className="tag-detail-page__credential-menu-placeholder"
          aria-hidden="true"
        />
      )}
    </li>
  );
}

function AuthenticationSummary({
  credentials,
  onCredentialDisconnect,
}: {
  credentials: readonly PlatformConnectionCredential[];
  onCredentialDisconnect?: (credentialId: string) => void | Promise<void>;
}) {
  return (
    <ul className="tag-detail-page__credential-list">
      {credentials.map((credential) => (
        <CredentialRow
          key={credential.id}
          credential={credential}
          onDisconnect={onCredentialDisconnect}
        />
      ))}
    </ul>
  );
}

function TagAuthenticationView({
  title,
  content,
  connected,
  loading,
  credentials,
  emptyTitle,
  emptyDescription,
  onAddCredentials,
  addCredentialsDisabled,
  onCredentialDisconnect,
}: {
  title: ReactNode;
  content?: ReactNode;
  connected: boolean;
  loading: boolean;
  credentials: readonly PlatformConnectionCredential[];
  emptyTitle: ReactNode;
  emptyDescription: ReactNode;
  onAddCredentials?: () => void;
  addCredentialsDisabled?: boolean;
  onCredentialDisconnect?: (credentialId: string) => void | Promise<void>;
}) {
  return (
    <section
      className="tag-detail-page__authentication"
      aria-label="Connector authentication"
    >
      <PlatformUiCard
        as="section"
        className={`tag-detail-page__authentication-surface${content ? " has-custom-content" : ""}${connected ? " is-connected" : ""}`}
      >
        <h2 className="tag-detail-page__section-title">{title}</h2>
        {loading ? (
          <PlatformLoadingState centered message="Loading authentication..." />
        ) : content ? (
          <div className="tag-detail-page__authentication-content">
            {content}
          </div>
        ) : connected ? (
          <AuthenticationSummary
            credentials={credentials}
            onCredentialDisconnect={onCredentialDisconnect}
          />
        ) : (
          <PlatformEmptyState
            icon={Plug}
            iconSize={28}
            title={emptyTitle}
            description={emptyDescription}
            primaryAction={
              onAddCredentials
                ? {
                    label: "Add Credentials",
                    onClick: onAddCredentials,
                    disabled: addCredentialsDisabled,
                    icon: Plus,
                    ariaLabel: "Add credentials",
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
  children,
}: {
  information: readonly TagDetailInformationRow[];
  includedItems: readonly TagDetailIncludedItem[];
  children: ReactNode;
}) {
  const hasInformation = information.length > 0;
  const hasIncludedItems = includedItems.length > 0;
  const functionGroups = [
    {
      id: "interactive",
      label: "Interactive",
      items: includedItems.filter((item) => item.access !== "read-only"),
    },
    {
      id: "read-only",
      label: "Read only",
      items: includedItems.filter((item) => item.access === "read-only"),
    },
  ].filter((group) => group.items.length > 0);

  const copyValue = (value: string) => {
    void navigator.clipboard?.writeText(value);
  };

  return (
    <div className="tag-detail-page__overview">
      {hasInformation || hasIncludedItems ? (
        <PlatformUiCard
          as="section"
          className="tag-detail-page__information-surface"
        >
          {hasInformation ? (
            <>
              <h2 className="tag-detail-page__section-title">Information</h2>
              <dl className="tag-detail-page__information-list">
                {information.map((row) => (
                  <div
                    className="tag-detail-page__information-row"
                    key={row.id}
                  >
                    <dt>{row.label}</dt>
                    <dd className={row.monospace ? "is-monospace" : undefined}>
                      {row.copyValue ? (
                        <button
                          type="button"
                          className="tag-detail-page__copy-value"
                          onClick={() => copyValue(row.copyValue || "")}
                          aria-label={`Copy ${String(row.label).toLowerCase()}`}
                        >
                          <Copy
                            width={13}
                            height={13}
                            strokeWidth={1.7}
                            aria-hidden="true"
                          />
                          <span>{row.value}</span>
                        </button>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          ) : null}

          {hasIncludedItems ? (
            <div className="tag-detail-page__included">
              <h2 className="tag-detail-page__section-title">
                Included elements
              </h2>
              <div className="tag-detail-page__function-groups">
                {functionGroups.map((group) => (
                  <section
                    className="tag-detail-page__function-group"
                    key={group.id}
                  >
                    <div className="tag-detail-page__function-group-header">
                      <ChevronDown
                        width={13}
                        height={13}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                      <span>{group.label}</span>
                      <PlatformLabel variant="gray">
                        {group.items.length}
                      </PlatformLabel>
                    </div>
                    <div className="tag-detail-page__function-list">
                      {group.items.map((item) => (
                        <TagDetailFunctionItem item={item} key={item.id} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          ) : null}
        </PlatformUiCard>
      ) : (
        children
      )}
    </div>
  );
}

const JSON_TOKEN_PATTERN =
  /("(?:\\.|[^"\\])*")(?=\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/gi;

function renderJsonCodeLine(line: string, lineIndex: number) {
  const output: ReactNode[] = [];
  const pattern = new RegExp(
    JSON_TOKEN_PATTERN.source,
    JSON_TOKEN_PATTERN.flags,
  );
  let cursor = 0;
  let match = pattern.exec(line);

  while (match) {
    if (match.index > cursor) output.push(line.slice(cursor, match.index));
    const token = match[0];
    const tokenClass = match[1]
      ? "is-property"
      : match[2]
        ? "is-string"
        : /^(?:true|false|null)$/i.test(token)
          ? "is-literal"
          : "is-number";
    output.push(
      <span
        className={`tag-detail-page__schema-token ${tokenClass}`}
        key={`${lineIndex}:${match.index}:${token}`}
      >
        {token}
      </span>,
    );
    cursor = match.index + token.length;
    match = pattern.exec(line);
  }

  if (cursor < line.length) output.push(line.slice(cursor));
  return output.length ? output : "\u00a0";
}

function TagDetailFunctionItem({ item }: { item: TagDetailIncludedItem }) {
  const [expanded, setExpanded] = useState(false);
  const panelId = `${useId().replace(/:/g, "")}-schema`;
  const schemaText = useMemo(
    () => (item.inputSchema ? JSON.stringify(item.inputSchema, null, 2) : ""),
    [item.inputSchema],
  );
  const hasSchema = Boolean(schemaText);

  const content = (
    <>
      {item.icon ? (
        <span
          className="tag-detail-page__function-item-icon"
          aria-hidden="true"
        >
          {item.icon}
        </span>
      ) : null}
      <span className="tag-detail-page__function-item-copy">
        <span className="tag-detail-page__function-item-title">
          {item.title}
        </span>
        {item.description ? (
          <span className="tag-detail-page__function-item-description">
            {item.description}
          </span>
        ) : null}
      </span>
      {hasSchema ? (
        <ChevronRight
          className="tag-detail-page__function-item-chevron"
          width={14}
          height={14}
          strokeWidth={1.8}
          aria-hidden="true"
        />
      ) : null}
    </>
  );

  return (
    <div
      className={`tag-detail-page__function-item${expanded ? " is-expanded" : ""}`}
      data-capability-id={item.id}
    >
      {hasSchema ? (
        <button
          type="button"
          className="tag-detail-page__function-item-trigger"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((current) => !current)}
        >
          {content}
        </button>
      ) : (
        <div className="tag-detail-page__function-item-trigger">{content}</div>
      )}
      {hasSchema ? (
        <div
          id={panelId}
          className="tag-detail-page__schema-panel"
          data-expanded={expanded ? "true" : "false"}
          aria-hidden={!expanded}
          hidden={!expanded}
        >
          <div className="tag-detail-page__schema-panel-inner">
            <div className="tag-detail-page__schema-toolbar">
              <span>json</span>
              <PlatformIconButton
                type="button"
                size="compact"
                aria-label={`Copy ${item.id} input schema`}
                title="Copy input schema"
                onClick={() => {
                  void navigator.clipboard?.writeText(schemaText);
                }}
              >
                <Copy aria-hidden="true" />
              </PlatformIconButton>
            </div>
            <pre className="tag-detail-page__schema-code">
              <code>
                {schemaText.split("\n").map((line, lineIndex) => (
                  <span
                    className="tag-detail-page__schema-line"
                    key={`${lineIndex}:${line}`}
                  >
                    {renderJsonCodeLine(line, lineIndex)}
                  </span>
                ))}
              </code>
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function TagDetailPage({
  identityIcon,
  identityKind = "plugins",
  identityId,
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
  credentials = [],
  onCredentialDisconnect,
  authenticationTitle = "Credentials available for this connector",
  authenticationEmptyTitle = "No authentication yet",
  authenticationEmptyDescription = "Connect this integration to use its protected data and actions.",
  agentTriggers,
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
  const [credentialModalOpen, setCredentialModalOpen] = useState(false);
  const [credentialName, setCredentialName] = useState("");
  const [credentialSubmitting, setCredentialSubmitting] = useState(false);
  const [credentialError, setCredentialError] = useState("");
  const [credentialValues, setCredentialValues] = useState<Record<string, string>>({});
  const credentialNameInputRef = useRef<HTMLInputElement>(null);
  const connectorName =
    typeof identityTitle === "string" && identityTitle.trim()
      ? identityTitle.trim()
      : "Connector";
  const normalizedCredentials = useMemo(
    () => normalizePlatformConnectionCredentials(credentials),
    [credentials],
  );
  const resolvedCredentials = useMemo<PlatformConnectionCredential[]>(() => {
    if (normalizedCredentials.length > 0) return normalizedCredentials;
    if (!authenticationConnected) return [];
    const identity =
      typeof authenticationIdentity === "string"
        ? authenticationIdentity.trim()
        : connectorName;
    const method =
      typeof authenticationMethod === "string"
        ? authenticationMethod.trim()
        : "OAuth 2.0";
    return [
      {
        id: `legacy-default-${identityId || "connector"}`,
        name: identity || `${connectorName} account`,
        identity,
        method: method || "OAuth 2.0",
        status: "valid",
        isDefault: true,
        createdAt: "",
        updatedAt: "",
        lastCheckedAt: new Date().toISOString(),
      },
    ];
  }, [
    authenticationConnected,
    authenticationIdentity,
    authenticationMethod,
    connectorName,
    identityId,
    normalizedCredentials,
  ]);
  const hasCredentials = resolvedCredentials.length > 0;
  const hasAgentTriggers = agentTriggers !== undefined && agentTriggers !== null;
  const detailTabs = useMemo<readonly { id: TagDetailTab; label: string }[]>(
    () => [
      { id: "overview", label: "Overview" },
      { id: "authentication", label: "Authentication" },
      ...(hasAgentTriggers
        ? [{ id: "agent-triggers" as const, label: "Agent Triggers" }]
        : []),
      { id: "permissions", label: "Permissions" },
    ],
    [hasAgentTriggers],
  );
  const sidebarAutoCollapseTabs = useMemo<readonly TagDetailTab[]>(
    () => detailTabs.map((tab) => tab.id),
    [detailTabs],
  );

  useEffect(() => {
    if (!credentialModalOpen) return;
    const timeout = window.setTimeout(
      () => credentialNameInputRef.current?.focus(),
      0,
    );
    return () => window.clearTimeout(timeout);
  }, [credentialModalOpen]);

  const openCredentialModal = () => {
    if (!connectionAction || connectionAction.disabled) return;
    setCredentialName("");
    setCredentialValues(
      Object.fromEntries(
        (connectionAction.credentialFields || [])
          .filter((field) => field.type === "select" && field.options?.[0]?.value)
          .map((field) => [field.id, field.options?.[0]?.value || ""]),
      ),
    );
    setCredentialError("");
    setCredentialModalOpen(true);
  };

  const closeCredentialModal = () => {
    if (credentialSubmitting) return;
    setCredentialError("");
    setCredentialValues({});
    setCredentialModalOpen(false);
  };

  const submitCredential = async () => {
    const normalizedName = credentialName.trim();
    const requiredFields = connectionAction?.credentialFields?.filter(
      (field) => field.required !== false,
    ) || [];
    const hasMissingValue = requiredFields.some(
      (field) => !String(credentialValues[field.id] || "").trim(),
    );
    if (
      !connectionAction
      || !normalizedName
      || hasMissingValue
      || credentialSubmitting
    ) {
      return;
    }
    setCredentialSubmitting(true);
    setCredentialError("");
    try {
      if (connectionAction.credentialFields?.length) {
        await connectionAction.onClick(normalizedName, credentialValues);
      } else {
        await connectionAction.onClick(normalizedName);
      }
      setCredentialModalOpen(false);
      setCredentialValues({});
    } catch (error) {
      setCredentialError(
        error instanceof Error && error.message.trim()
          ? error.message
          : `Unable to connect ${connectorName}.`,
      );
    } finally {
      setCredentialSubmitting(false);
    }
  };

  const activeContent =
    activeTab === "authentication" ? (
      <TagAuthenticationView
        title={authenticationTitle}
        content={authentication}
        connected={hasCredentials}
        loading={authenticationLoading}
        credentials={resolvedCredentials}
        emptyTitle={authenticationEmptyTitle}
        emptyDescription={authenticationEmptyDescription}
        onAddCredentials={connectionAction ? openCredentialModal : undefined}
        addCredentialsDisabled={connectionAction?.disabled}
        onCredentialDisconnect={onCredentialDisconnect}
      />
    ) : activeTab === "agent-triggers" && hasAgentTriggers ? (
      agentTriggers
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
      >
        {children}
      </TagOverviewView>
    );

  return (
    <>
      <ResourceDetailPage<TagDetailTab>
        header={
          <TagDetailIdentity
            icon={identityIcon}
            kind={identityKind}
            identityId={identityId}
            title={identityTitle}
            description={identityDescription}
          />
        }
        headerActions={
          connectionAction ? (
            <ConnectionButton
              action={connectionAction}
              onClick={openCredentialModal}
            />
          ) : undefined
        }
        tabs={detailTabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        tabBarActions={tabBarActions}
        sidebarToggle={sidebarToggle}
        sidebar={sidebar}
        sidebarCollapsed={sidebarCollapsed}
        sidebarAutoCollapseTabs={sidebarAutoCollapseTabs}
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

      <PlatformModal
        open={credentialModalOpen}
        title={connectorName}
        headerVariant="media"
        headerMedia={
          <div className="tag-detail-page__credential-modal-identity">
            <ConnectionIdentityIcon
              kind={identityKind}
              connectionId={identityId}
              icon={identityIcon}
              variant="catalog"
              className="tag-detail-page__credential-modal-icon"
            />
            <span>{connectorName}</span>
          </div>
        }
        size="small"
        className="tag-detail-page__credential-modal"
        initialFocusRef={credentialNameInputRef}
        onClose={closeCredentialModal}
        closeButtonDisabled={credentialSubmitting}
        footer={
          <>
            <PlatformSecondaryButton
              type="button"
              size="medium"
              onClick={closeCredentialModal}
              disabled={credentialSubmitting}
            >
              Cancel
            </PlatformSecondaryButton>
            <PlatformPrimaryButton
              type="button"
              size="medium"
              onClick={() => void submitCredential()}
              disabled={
                !credentialName.trim()
                || credentialSubmitting
                || Boolean(connectionAction?.credentialFields?.some(
                  (field) =>
                    field.required !== false
                    && !String(credentialValues[field.id] || "").trim(),
                ))
              }
            >
              {credentialSubmitting ? "Connecting..." : "Add Credentials"}
            </PlatformPrimaryButton>
          </>
        }
      >
        <div className="tag-detail-page__credential-form">
          <label htmlFor="tag-detail-credential-name">Credential name</label>
          <input
            ref={credentialNameInputRef}
            id="tag-detail-credential-name"
            type="text"
            value={credentialName}
            placeholder="e.g. Work account"
            autoComplete="off"
            disabled={credentialSubmitting}
            aria-invalid={credentialError ? "true" : undefined}
            aria-describedby={
              credentialError ? "tag-detail-credential-error" : undefined
            }
            onChange={(event) => setCredentialName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void submitCredential();
              }
            }}
          />
          <p>
            Give these credentials a recognizable name. You can connect another
            account later.
          </p>
          {connectionAction?.credentialFields?.map((field) => {
            const inputId = `tag-detail-credential-${field.id}`;
            return (
              <div
                key={field.id}
                className="tag-detail-page__credential-provider-field"
              >
                <label htmlFor={inputId}>{field.label}</label>
                {field.type === "select" ? (
                  <PlatformSelector
                    value={credentialValues[field.id] || field.options?.[0]?.value || ""}
                    options={field.options || []}
                    ariaLabel={typeof field.label === "string" ? field.label : field.id}
                    fullWidth
                    popupClassName="is-minimal"
                    onValueChange={(value) =>
                      setCredentialValues((current) => ({
                        ...current,
                        [field.id]: value,
                      }))
                    }
                  />
                ) : field.type === "textarea" ? (
                  <textarea
                    id={inputId}
                    value={credentialValues[field.id] || ""}
                    placeholder={field.placeholder}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={credentialSubmitting}
                    onChange={(event) =>
                      setCredentialValues((current) => ({
                        ...current,
                        [field.id]: event.target.value,
                      }))
                    }
                  />
                ) : (
                  <input
                    id={inputId}
                    type={field.type === "text" ? "text" : "password"}
                    value={credentialValues[field.id] || ""}
                    placeholder={field.placeholder}
                    autoComplete="off"
                    disabled={credentialSubmitting}
                    onChange={(event) =>
                      setCredentialValues((current) => ({
                        ...current,
                        [field.id]: event.target.value,
                      }))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void submitCredential();
                      }
                    }}
                  />
                )}
                {field.description ? <p>{field.description}</p> : null}
              </div>
            );
          })}
          {credentialError ? (
            <p
              id="tag-detail-credential-error"
              className="tag-detail-page__credential-form-error"
              role="alert"
            >
              {credentialError}
            </p>
          ) : null}
        </div>
      </PlatformModal>
    </>
  );
}

import {
  Activity,
  Bot,
  ClipboardCopy,
  KeyRound,
  Plus,
  RefreshCw,
  RotateCw,
  Route,
  Trash2,
  UserRound,
  Webhook,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ExternalAgentBinding,
  ExternalAgentEventRecord,
  ExternalAgentIdentity,
  ExternalAgentProvider,
  ExternalAgentTrigger,
} from "../../../platform-integrations/external-agents/contracts.js";
import {
  PlatformDataTable,
  type PlatformDataTableAction,
  type PlatformDataTableColumn,
} from "../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformLoadingState } from "../../../platform-ui/components/composite/loading-state/index.js";
import {
  PlatformModal,
  PlatformSetupModal,
  PlatformSetupModalStep,
} from "../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../platform-ui/components/ui/button/index.js";
import { PlatformCheckbox } from "../../../platform-ui/components/ui/checkbox/index.js";
import { PlatformLabel } from "../../../platform-ui/components/ui/label/index.js";
import { PlatformSelector } from "../../../platform-ui/components/ui/selector/index.js";
import type { PlatformConnectionCredential } from "../../shared/connections/connection-credentials.js";
import {
  ExternalAgentTriggerClient,
  type CreateExternalAgentBindingInput,
  type ExternalAgentInstallationSetup,
  type ExternalAgentInstallationView,
  type ExternalAgentOrganizationMember,
  type ExternalAgentTriggerSnapshot,
} from "./external-agent-trigger-client.js";

interface ResourceOption {
  id: string;
  label: string;
  description: string;
  photoUrl: string;
}

interface InstallationFormState {
  credentialId: string;
  tenantId: string;
  displayName: string;
  siteUrl: string;
  appActorId: string;
  mentionAliases: string;
}

interface BindingFormState {
  installationId: string;
  externalProjectId: string;
  displayName: string;
  agentId: string;
  environment: string;
  triggerModes: ExternalAgentTrigger[];
  permissionMode: "linked_member" | "external_requester";
  allowedExternalUserIds: string;
}

interface IdentityFormState {
  installationId: string;
  providerUserId: string;
  platformUserId: string;
  displayName: string;
  email: string;
}

interface ConfirmState {
  title: string;
  description: string;
  actionLabel: string;
  run: () => Promise<void>;
}

export interface ExternalAgentTriggersPageProps {
  provider: ExternalAgentProvider;
  organizationId: string;
  credentials?: readonly PlatformConnectionCredential[];
  agents?: readonly unknown[];
  environments?: readonly unknown[];
  projects?: readonly unknown[];
  connectionProfile?: unknown;
  managementBaseUrl?: string;
  organizationApiBaseUrl?: string;
  onOpenThread?: (threadId: string) => void;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = stringValue(value);
    if (normalized) return normalized;
  }
  return "";
}

function recursiveText(value: unknown, keys: readonly string[], depth = 0): string {
  if (depth > 4) return "";
  const record = asRecord(value);
  if (!record) return "";
  for (const key of keys) {
    const direct = stringValue(record[key]);
    if (direct) return direct;
  }
  for (const nested of Object.values(record)) {
    const result = recursiveText(nested, keys, depth + 1);
    if (result) return result;
  }
  return "";
}

function normalizeResourceOptions(
  values: readonly unknown[] | undefined,
  type: "agent" | "environment" | "project",
): ResourceOption[] {
  const seen = new Set<string>();
  return (values || []).flatMap((value) => {
    const record = asRecord(value);
    if (!record) return [];
    const id = firstText(
      record.id,
      type === "agent" ? record.agentId : undefined,
      type === "environment" ? record.environmentId : undefined,
      type === "project" ? record.projectId : undefined,
      record.value,
    );
    if (!id || seen.has(id)) return [];
    seen.add(id);
    const label = firstText(
      record.name,
      record.label,
      record.displayName,
      record.title,
      id,
    );
    return [{
      id,
      label,
      description: firstText(record.description, record.subtitle, record.type),
      photoUrl: firstText(record.photoURL, record.photoUrl, record.avatarUrl, record.image),
    }];
  });
}

function formatDate(value: string | undefined): string {
  const timestamp = Date.parse(value || "");
  if (!Number.isFinite(timestamp)) return "-";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function providerLabel(provider: ExternalAgentProvider): string {
  return provider === "jira" ? "Jira" : "Linear";
}

function providerTerms(provider: ExternalAgentProvider) {
  return provider === "jira"
    ? {
        tenant: "Atlassian cloud ID",
        externalProject: "Jira project ID or key",
        providerUser: "Atlassian account ID",
        resource: "issue",
      }
    : {
        tenant: "Linear workspace ID",
        externalProject: "Linear team ID",
        providerUser: "Linear user ID",
        resource: "issue",
      };
}

function statusVariant(status: string): "gray" | "green" | "blue" | "yellow" | "red" {
  if (["completed", "enabled", "active", "healthy"].includes(status)) return "green";
  if (["processing", "pending", "running"].includes(status)) return "blue";
  if (["failed", "denied", "disabled", "error"].includes(status)) return "gray";
  return "gray";
}

function StatusLabel({ value }: { value: string }) {
  const label = value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : "Unknown";
  return <PlatformLabel variant={statusVariant(value)}>{label}</PlatformLabel>;
}

function ProfileOption({ option }: { option: ResourceOption }) {
  return (
    <span className="external-agent-triggers__profile-option">
      {option.photoUrl ? <img src={option.photoUrl} alt="" /> : <Bot aria-hidden="true" />}
      <span>{option.label}</span>
    </span>
  );
}

function MemberOption({ member }: { member: ExternalAgentOrganizationMember }) {
  return (
    <span className="external-agent-triggers__profile-option">
      {member.photoUrl ? <img src={member.photoUrl} alt="" /> : <UserRound aria-hidden="true" />}
      <span>{member.name}</span>
    </span>
  );
}

function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="external-agent-triggers__section">
      <header className="external-agent-triggers__section-header">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  description,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  description?: string;
}) {
  return (
    <label className="external-agent-triggers__field">
      <span>{label}</span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
      {description ? <small>{description}</small> : null}
    </label>
  );
}

function SetupModal({
  setup,
  provider,
  onClose,
}: {
  setup: ExternalAgentInstallationSetup | null;
  provider: ExternalAgentProvider;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState("");
  if (!setup) return null;
  const callbackValue = setup.callbackUrlWithToken || setup.callbackUrl;
  const copy = async (label: string, value: string) => {
    await navigator.clipboard?.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1_500);
  };
  return (
    <PlatformModal
      open
      title={`${providerLabel(provider)} webhook setup`}
      description="Complete the provider setup with these generated values."
      size="medium"
      onClose={onClose}
      footer={
        <PlatformPrimaryButton size="medium" onClick={onClose}>
          Done
        </PlatformPrimaryButton>
      }
    >
      <div className="external-agent-triggers__setup">
        <p className="external-agent-triggers__setup-guidance">
          {provider === "jira"
            ? "Create a Jira webhook for issue and comment events. Use the complete callback URL below; it contains the verification token."
            : "Create a Linear webhook for issue and comment events. Use the callback URL and enter the signing secret in Linear."}
        </p>
        <div className="external-agent-triggers__copy-field">
          <span>Callback URL</span>
          <code>{callbackValue}</code>
          <PlatformSecondaryButton size="small" onClick={() => void copy("url", callbackValue)}>
            <ClipboardCopy aria-hidden="true" />
            {copied === "url" ? "Copied" : "Copy"}
          </PlatformSecondaryButton>
        </div>
        {setup.verificationSecret ? (
          <div className="external-agent-triggers__copy-field">
            <span>{provider === "linear" ? "Signing secret" : "Verification token"}</span>
            <code>{setup.verificationSecret}</code>
            <PlatformSecondaryButton
              size="small"
              onClick={() => void copy("secret", setup.verificationSecret || "")}
            >
              <ClipboardCopy aria-hidden="true" />
              {copied === "secret" ? "Copied" : "Copy"}
            </PlatformSecondaryButton>
          </div>
        ) : null}
        {setup.verificationSecret ? (
          <p className="external-agent-triggers__secret-warning">
            This secret is shown once. Store it in {providerLabel(provider)} before closing.
          </p>
        ) : null}
      </div>
    </PlatformModal>
  );
}

export function ExternalAgentTriggersPage({
  provider,
  organizationId,
  credentials = [],
  agents = [],
  environments = [],
  projects = [],
  connectionProfile,
  managementBaseUrl,
  organizationApiBaseUrl,
  onOpenThread,
}: ExternalAgentTriggersPageProps) {
  const terms = providerTerms(provider);
  const client = useMemo(
    () => new ExternalAgentTriggerClient({
      organizationId,
      managementBaseUrl,
      organizationApiBaseUrl,
    }),
    [managementBaseUrl, organizationApiBaseUrl, organizationId],
  );
  const agentOptions = useMemo(() => normalizeResourceOptions(agents, "agent"), [agents]);
  const environmentOptions = useMemo(
    () => normalizeResourceOptions(environments, "environment"),
    [environments],
  );
  const projectOptions = useMemo(() => normalizeResourceOptions(projects, "project"), [projects]);
  const [snapshot, setSnapshot] = useState<ExternalAgentTriggerSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [installationModalOpen, setInstallationModalOpen] = useState(false);
  const [bindingModalOpen, setBindingModalOpen] = useState(false);
  const [identityModalOpen, setIdentityModalOpen] = useState(false);
  const [setup, setSetup] = useState<ExternalAgentInstallationSetup | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [installationForm, setInstallationForm] = useState<InstallationFormState>({
    credentialId: credentials[0]?.id || "",
    tenantId: recursiveText(connectionProfile, [
      "cloudId",
      "tenantId",
      "workspaceId",
      "organizationId",
    ]),
    displayName: "",
    siteUrl: recursiveText(connectionProfile, ["siteUrl", "baseUrl", "url"]),
    appActorId: recursiveText(connectionProfile, ["appActorId", "botUserId", "actorId"]),
    mentionAliases: "computer agents",
  });
  const [bindingForm, setBindingForm] = useState<BindingFormState>({
    installationId: "",
    externalProjectId: "",
    displayName: "",
    agentId: "",
    environment: "",
    triggerModes: ["mention", "assignment", "command"],
    permissionMode: "linked_member",
    allowedExternalUserIds: "",
  });
  const [identityForm, setIdentityForm] = useState<IdentityFormState>({
    installationId: "",
    providerUserId: "",
    platformUserId: "",
    displayName: "",
    email: "",
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setSnapshot(await client.load(provider));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load agent triggers.");
    } finally {
      setLoading(false);
    }
  }, [client, provider]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runMutation = async (action: () => Promise<void>, successMessage: string) => {
    setBusy(true);
    setError("");
    try {
      await action();
      setNotice(successMessage);
      await refresh();
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "The operation failed.");
    } finally {
      setBusy(false);
    }
  };

  const installations = snapshot?.installations || [];
  const bindings = snapshot?.bindings || [];
  const identities = snapshot?.identities || [];
  const events = snapshot?.events || [];
  const members = snapshot?.members || [];
  const agentById = useMemo(() => new Map(agentOptions.map((item) => [item.id, item])), [agentOptions]);
  const environmentById = useMemo(
    () => new Map(environmentOptions.map((item) => [item.id, item])),
    [environmentOptions],
  );
  const projectById = useMemo(() => new Map(projectOptions.map((item) => [item.id, item])), [projectOptions]);
  const memberById = useMemo(() => new Map(members.map((item) => [item.id, item])), [members]);

  const openInstallationModal = () => {
    setError("");
    setInstallationForm((current) => ({
      ...current,
      credentialId: current.credentialId || credentials[0]?.id || "",
    }));
    setInstallationModalOpen(true);
  };
  const openBindingModal = () => {
    setBindingForm((current) => ({
      ...current,
      installationId: current.installationId || installations[0]?.id || "",
      agentId: current.agentId || agentOptions[0]?.id || "",
      environment: current.environment || (
        environmentOptions[0]
          ? `environment:${environmentOptions[0].id}`
          : projectOptions[0]
            ? `project:${projectOptions[0].id}`
            : ""
      ),
    }));
    setBindingModalOpen(true);
  };
  const openIdentityModal = () => {
    setIdentityForm((current) => ({
      ...current,
      installationId: current.installationId || installations[0]?.id || "",
      platformUserId: current.platformUserId || members[0]?.id || "",
    }));
    setIdentityModalOpen(true);
  };

  const installationColumns = useMemo<PlatformDataTableColumn<ExternalAgentInstallationView>[]>(
    () => [
      { id: "name", header: "Connection", accessor: (row) => row.displayName },
      { id: "tenant", header: terms.tenant, accessor: (row) => row.tenantId },
      {
        id: "callback",
        header: "Webhook",
        cell: ({ row }) => row.callbackUrl ? (
          <button
            type="button"
            className="external-agent-triggers__text-action"
            onClick={(event) => {
              event.stopPropagation();
              void navigator.clipboard?.writeText(row.callbackUrl || "");
              setNotice("Webhook URL copied.");
            }}
          >
            Copy URL
          </button>
        ) : "-",
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <StatusLabel value={row.enabled ? "enabled" : "disabled"} />,
      },
    ],
    [terms.tenant],
  );

  const installationActions = useCallback(
    (installation: ExternalAgentInstallationView): readonly PlatformDataTableAction<ExternalAgentInstallationView>[] => [
      {
        id: "rotate",
        label: "Rotate webhook secret",
        icon: RotateCw,
        onSelect: () => void runMutation(async () => {
          const result = await client.updateInstallation(installation.id, {
            rotateWebhookSecret: true,
          });
          if (result.setup) setSetup(result.setup);
        }, "Webhook secret rotated."),
      },
      {
        id: "toggle",
        label: installation.enabled ? "Disable" : "Enable",
        icon: installation.enabled ? KeyRound : Webhook,
        onSelect: () => void runMutation(async () => {
          await client.updateInstallation(installation.id, { enabled: !installation.enabled });
        }, installation.enabled ? "Webhook disabled." : "Webhook enabled."),
      },
      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        separatorBefore: true,
        onSelect: () => setConfirmState({
          title: "Delete webhook installation?",
          description: "Its routes, identity mappings, and active external work will be removed.",
          actionLabel: "Delete",
          run: () => client.deleteInstallation(installation.id),
        }),
      },
    ],
    [client],
  );

  const bindingColumns = useMemo<PlatformDataTableColumn<ExternalAgentBinding>[]>(
    () => [
      {
        id: "scope",
        header: terms.externalProject,
        cell: ({ row }) => row.externalProjectId || "Fallback route",
      },
      {
        id: "agent",
        header: "Agent",
        cell: ({ row }) => agentById.get(row.agentId)?.label || row.agentName || row.agentId,
      },
      {
        id: "environment",
        header: "Environment",
        cell: ({ row }) => row.projectId
          ? projectById.get(row.projectId)?.label || row.projectId
          : environmentById.get(row.environmentId || "")?.label || row.environmentId || "Default",
      },
      {
        id: "triggers",
        header: "Triggers",
        cell: ({ row }) => row.triggerModes.join(", "),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => <StatusLabel value={row.enabled ? "enabled" : "disabled"} />,
      },
    ],
    [agentById, environmentById, projectById, terms.externalProject],
  );

  const bindingActions = useCallback(
    (binding: ExternalAgentBinding): readonly PlatformDataTableAction<ExternalAgentBinding>[] => [
      {
        id: "toggle",
        label: binding.enabled ? "Disable" : "Enable",
        icon: Route,
        onSelect: () => void runMutation(async () => {
          await client.updateBinding(binding.id, { enabled: !binding.enabled });
        }, binding.enabled ? "Route disabled." : "Route enabled."),
      },
      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        separatorBefore: true,
        onSelect: () => setConfirmState({
          title: "Delete routing rule?",
          description: "New provider events will no longer use this agent route.",
          actionLabel: "Delete",
          run: () => client.deleteBinding(binding.id),
        }),
      },
    ],
    [client],
  );

  const identityColumns = useMemo<PlatformDataTableColumn<ExternalAgentIdentity>[]>(
    () => [
      {
        id: "provider",
        header: terms.providerUser,
        cell: ({ row }) => row.displayName || row.email || row.providerUserId,
      },
      {
        id: "member",
        header: "Organization member",
        cell: ({ row }) => {
          const member = memberById.get(row.platformUserId);
          return member ? <MemberOption member={member} /> : row.platformUserId;
        },
      },
      { id: "verified", header: "Verified", cell: ({ row }) => formatDate(row.verifiedAt) },
    ],
    [memberById, terms.providerUser],
  );

  const identityActions = useCallback(
    (identity: ExternalAgentIdentity): readonly PlatformDataTableAction<ExternalAgentIdentity>[] => [{
      id: "delete",
      label: "Remove mapping",
      icon: Trash2,
      onSelect: () => setConfirmState({
        title: "Remove identity mapping?",
        description: "This provider user will no longer inherit the linked organization member's access.",
        actionLabel: "Remove",
        run: () => client.deleteIdentity(identity.id),
      }),
    }],
    [client],
  );

  const eventColumns = useMemo<PlatformDataTableColumn<ExternalAgentEventRecord>[]>(
    () => [
      {
        id: "resource",
        header: "Resource",
        cell: ({ row }) => row.envelope.resource.key || row.envelope.resource.title || row.envelope.resource.id,
      },
      { id: "trigger", header: "Trigger", accessor: (row) => row.envelope.trigger },
      {
        id: "thread",
        header: "Thread",
        cell: ({ row }) => row.threadId && onOpenThread ? (
          <button
            type="button"
            className="external-agent-triggers__text-action"
            onClick={(event) => {
              event.stopPropagation();
              onOpenThread?.(row.threadId || "");
            }}
          >
            {row.threadId}
          </button>
        ) : row.threadId || "-",
      },
      { id: "status", header: "Status", cell: ({ row }) => <StatusLabel value={row.status} /> },
      { id: "received", header: "Received", cell: ({ row }) => formatDate(row.receivedAt) },
    ],
    [onOpenThread],
  );

  const eventActions = useCallback(
    (event: ExternalAgentEventRecord): readonly PlatformDataTableAction<ExternalAgentEventRecord>[] => (
      ["failed", "denied"].includes(event.status)
        ? [{
            id: "replay",
            label: "Replay event",
            icon: RefreshCw,
            onSelect: () => void runMutation(
              () => client.replayEvent(event.id),
              "Event queued for replay.",
            ),
          }]
        : []
    ),
    [client],
  );

  if (loading && !snapshot) {
    return <PlatformLoadingState centered message={`Loading ${providerLabel(provider)} agent triggers...`} />;
  }

  return (
    <div className="external-agent-triggers" data-external-agent-provider={provider}>
      <header className="external-agent-triggers__intro">
        <div>
          <h1>Agent triggers</h1>
          <p>
            Start or continue Computer Agents threads from {providerLabel(provider)} {terms.resource}s,
            while preserving requester identity and organization permissions.
          </p>
        </div>
        <div className="external-agent-triggers__health">
          <PlatformLabel variant={snapshot?.health.started === false ? "gray" : "green"}>
            {snapshot?.health.started === false ? "Gateway offline" : "Gateway healthy"}
          </PlatformLabel>
          <PlatformSecondaryButton size="small" onClick={() => void refresh()} disabled={loading}>
            <RefreshCw aria-hidden="true" />
            Refresh
          </PlatformSecondaryButton>
        </div>
      </header>

      {error ? <div className="external-agent-triggers__message is-error">{error}</div> : null}
      {notice ? <div className="external-agent-triggers__message">{notice}</div> : null}

      <Section
        title="Webhook installation"
        description={`Connect a ${providerLabel(provider)} workspace and configure its verified callback.`}
        action={
          <PlatformPrimaryButton
            size="small"
            onClick={openInstallationModal}
            disabled={!credentials.length || busy}
            title={!credentials.length ? `Connect ${providerLabel(provider)} in Authentication first.` : undefined}
          >
            <Plus aria-hidden="true" />
            Configure webhook
          </PlatformPrimaryButton>
        }
      >
        <PlatformDataTable
          rows={installations}
          columns={installationColumns}
          getRowId={(row) => row.id}
          getRowActions={installationActions}
          ariaLabel={`${providerLabel(provider)} webhook installations`}
          variant="minimalistic-ui"
          pagination={false}
          emptyState={
            <PlatformEmptyState
              icon={Webhook}
              title="No webhook installation"
              description={credentials.length
                ? `Configure the ${providerLabel(provider)} workspace that should invoke agents.`
                : `Connect ${providerLabel(provider)} on the Authentication tab first.`}
            />
          }
        />
      </Section>

      <Section
        title="Routing"
        description={`Route a ${terms.externalProject.toLowerCase()} to an agent and its working environment.`}
        action={
          <PlatformSecondaryButton
            size="small"
            onClick={openBindingModal}
            disabled={
              !installations.length
              || !agentOptions.length
              || (!environmentOptions.length && !projectOptions.length)
              || busy
            }
          >
            <Plus aria-hidden="true" />
            Add routing
          </PlatformSecondaryButton>
        }
      >
        <PlatformDataTable
          rows={bindings}
          columns={bindingColumns}
          getRowId={(row) => row.id}
          getRowActions={bindingActions}
          ariaLabel={`${providerLabel(provider)} agent routing`}
          variant="minimalistic-ui"
          pagination={false}
          emptyState={
            <PlatformEmptyState
              icon={Route}
              title="No routing rules"
              description="Add a fallback route or map individual projects to different agents."
            />
          }
        />
      </Section>

      <Section
        title="Identity mappings"
        description={`Link ${providerLabel(provider)} users to organization members so platform permissions remain authoritative.`}
        action={
          <PlatformSecondaryButton
            size="small"
            onClick={openIdentityModal}
            disabled={!installations.length || !members.length || busy}
          >
            <Plus aria-hidden="true" />
            Map identity
          </PlatformSecondaryButton>
        }
      >
        <PlatformDataTable
          rows={identities}
          columns={identityColumns}
          getRowId={(row) => row.id}
          getRowActions={identityActions}
          ariaLabel={`${providerLabel(provider)} identity mappings`}
          variant="minimalistic-ui"
          pagination={false}
          emptyState={
            <PlatformEmptyState
              icon={UserRound}
              title="No identity mappings"
              description="Unlinked users are denied by linked-member routes until an administrator maps them."
            />
          }
        />
      </Section>

      <Section
        title="Recent activity"
        description="Inspect accepted, denied, and failed external invocations."
      >
        <PlatformDataTable
          rows={events}
          columns={eventColumns}
          getRowId={(row) => row.id}
          getRowActions={eventActions}
          ariaLabel={`${providerLabel(provider)} trigger activity`}
          variant="minimalistic-ui"
          pagination={false}
          emptyState={
            <PlatformEmptyState
              icon={Activity}
              title="No trigger activity"
              description={`Verified ${providerLabel(provider)} events will appear here after the first invocation.`}
            />
          }
        />
      </Section>

      <PlatformSetupModal
        open={installationModalOpen}
        title={`Connect ${providerLabel(provider)} to Computer Agents`}
        description={
          `Let ${providerLabel(provider)} issue and comment activity start agent work ` +
          "without giving the provider direct access to your organization."
        }
        features={[
          {
            id: "verified-events",
            icon: <KeyRound />,
            title: "Accept verified events only",
            description:
              "Installation-specific verification protects every incoming webhook request.",
          },
          {
            id: "explicit-routing",
            icon: <Route />,
            title: "Route work intentionally",
            description:
              "After setup, choose which projects, agents, and computers handle each event.",
          },
          {
            id: "identity-aware",
            icon: <UserRound />,
            title: "Keep organization permissions authoritative",
            description: "External identities are mapped before linked-member routes can run.",
          },
        ]}
        introFooter={
          `This creates a verified ${providerLabel(provider)} installation. ` +
          "No agent runs until you add a routing rule."
        }
        onClose={() => setInstallationModalOpen(false)}
        busy={busy}
        as="form"
        surfaceProps={{
          onSubmit: (event) => {
            event.preventDefault();
            if (!installationForm.credentialId || !installationForm.tenantId.trim() || busy) return;
            void runMutation(async () => {
              const result = await client.createInstallation({
                provider,
                credentialId: installationForm.credentialId,
                tenantId: installationForm.tenantId.trim(),
                displayName: installationForm.displayName.trim(),
                siteUrl: installationForm.siteUrl.trim(),
                appActorId: installationForm.appActorId.trim(),
                mentionAliases: installationForm.mentionAliases
                  .split(",")
                  .map((value) => value.trim())
                  .filter(Boolean),
              });
              setInstallationModalOpen(false);
              setSetup(result.setup);
            }, "Webhook installation created.");
          },
        }}
        footer={
          <>
            {error ? (
              <span className="external-agent-triggers__installation-error" role="alert">
                {error}
              </span>
            ) : null}
            <PlatformSecondaryButton
              type="button"
              size="medium"
              onClick={() => setInstallationModalOpen(false)}
              disabled={busy}
            >
              Cancel
            </PlatformSecondaryButton>
            <PlatformPrimaryButton
              type="submit"
              size="medium"
              disabled={!installationForm.credentialId || !installationForm.tenantId.trim() || busy}
            >
              Create webhook
            </PlatformPrimaryButton>
          </>
        }
      >
        <PlatformSetupModalStep
          number="1"
          title="Choose the authenticated connection"
          description={
            `Computer Agents uses this saved ${providerLabel(provider)} credential for provider API calls. ` +
            "The credential itself is never placed in the webhook URL."
          }
        >
          <div className="external-agent-triggers__field">
            <span>Authentication</span>
            <PlatformSelector
              value={installationForm.credentialId}
              options={credentials.map((credential) => ({
                value: credential.id,
                label: credential.name,
                description: credential.identity,
              }))}
              ariaLabel={`${providerLabel(provider)} credentials`}
              fullWidth
              popupClassName="is-minimal"
              onValueChange={(value) =>
                setInstallationForm((current) => ({ ...current, credentialId: value }))
              }
            />
          </div>
        </PlatformSetupModalStep>

        <PlatformSetupModalStep
          number="2"
          title={`Identify the ${providerLabel(provider)} workspace`}
          description={
            provider === "jira"
              ? "The Atlassian cloud ID is the stable workspace identifier. The name and site URL make it recognizable to administrators."
              : "The workspace ID is the stable organization identifier. Add a clear name so administrators can recognize it later."
          }
        >
          <div className="external-agent-triggers__installation-fields">
            <TextField
              label={terms.tenant}
              value={installationForm.tenantId}
              required
              placeholder={provider === "jira" ? "Atlassian cloud ID" : "Linear organization ID"}
              onChange={(value) =>
                setInstallationForm((current) => ({ ...current, tenantId: value }))
              }
            />
            <TextField
              label="Connection name"
              value={installationForm.displayName}
              placeholder={`${providerLabel(provider)} workspace`}
              onChange={(value) =>
                setInstallationForm((current) => ({ ...current, displayName: value }))
              }
            />
            {provider === "jira" ? (
              <TextField
                label="Jira site URL"
                value={installationForm.siteUrl}
                placeholder="https://company.atlassian.net"
                onChange={(value) =>
                  setInstallationForm((current) => ({ ...current, siteUrl: value }))
                }
              />
            ) : null}
          </div>
        </PlatformSetupModalStep>

        <PlatformSetupModalStep
          number="3"
          title="Control how agent activity is recognized"
          description="These optional values prevent reply loops and determine which names count as an agent mention."
        >
          <div className="external-agent-triggers__installation-fields">
            <TextField
              label="App actor ID"
              value={installationForm.appActorId}
              placeholder={provider === "jira" ? "Atlassian app account ID" : "Linear app user ID"}
              description="Prevents the integration from retriggering on its own replies and enables assignments."
              onChange={(value) =>
                setInstallationForm((current) => ({ ...current, appActorId: value }))
              }
            />
            <TextField
              label="Mention aliases"
              value={installationForm.mentionAliases}
              placeholder="computer agents, @computer-agents"
              description="Comma-separated names recognized in comments."
              onChange={(value) =>
                setInstallationForm((current) => ({ ...current, mentionAliases: value }))
              }
            />
          </div>
        </PlatformSetupModalStep>
      </PlatformSetupModal>

      <PlatformModal
        open={bindingModalOpen}
        title="Add agent routing"
        size="medium"
        onClose={() => !busy && setBindingModalOpen(false)}
        closeButtonDisabled={busy}
        footer={
          <>
            <PlatformSecondaryButton size="medium" onClick={() => setBindingModalOpen(false)} disabled={busy}>
              Cancel
            </PlatformSecondaryButton>
            <PlatformPrimaryButton
              size="medium"
              disabled={
                !bindingForm.installationId
                || !bindingForm.agentId
                || !bindingForm.environment
                || !bindingForm.triggerModes.length
                || (bindingForm.permissionMode === "external_requester"
                  && !bindingForm.allowedExternalUserIds.trim())
                || busy
              }
              onClick={() => void runMutation(async () => {
                const [environmentType, environmentId] = bindingForm.environment.split(":", 2);
                const agent = agentById.get(bindingForm.agentId);
                const input: CreateExternalAgentBindingInput = {
                  installationId: bindingForm.installationId,
                  externalProjectId: bindingForm.externalProjectId.trim(),
                  displayName: bindingForm.displayName.trim(),
                  agentId: bindingForm.agentId,
                  agentName: agent?.label,
                  ...(environmentType === "project"
                    ? { projectId: environmentId }
                    : { environmentId }),
                  triggerModes: bindingForm.triggerModes,
                  permissionMode: bindingForm.permissionMode,
                  allowedExternalUserIds: bindingForm.allowedExternalUserIds
                    .split(",")
                    .map((value) => value.trim())
                    .filter(Boolean),
                };
                await client.createBinding(input);
                setBindingModalOpen(false);
              }, "Routing rule created.")}
            >
              Add routing
            </PlatformPrimaryButton>
          </>
        }
      >
        <div className="external-agent-triggers__form">
          <label className="external-agent-triggers__field">
            <span>Webhook installation</span>
            <PlatformSelector
              value={bindingForm.installationId}
              options={installations.map((item) => ({ value: item.id, label: item.displayName, description: item.tenantId }))}
              ariaLabel="Webhook installation"
              fullWidth
              popupClassName="is-minimal"
              onValueChange={(value) => setBindingForm((current) => ({ ...current, installationId: value }))}
            />
          </label>
          <TextField
            label={terms.externalProject}
            value={bindingForm.externalProjectId}
            placeholder="Leave empty for the fallback route"
            description="A fallback route handles projects without a more specific active rule."
            onChange={(value) => setBindingForm((current) => ({ ...current, externalProjectId: value }))}
          />
          <TextField
            label="Routing name"
            value={bindingForm.displayName}
            placeholder="Support triage"
            onChange={(value) => setBindingForm((current) => ({ ...current, displayName: value }))}
          />
          <label className="external-agent-triggers__field">
            <span>Agent</span>
            <PlatformSelector
              value={bindingForm.agentId}
              options={agentOptions.map((option) => ({
                value: option.id,
                label: <ProfileOption option={option} />,
                description: option.description,
              }))}
              ariaLabel="Agent"
              fullWidth
              popupClassName="is-minimal"
              onValueChange={(value) => setBindingForm((current) => ({ ...current, agentId: value }))}
            />
          </label>
          <label className="external-agent-triggers__field">
            <span>Environment</span>
            <PlatformSelector
              value={bindingForm.environment}
              options={[
                ...environmentOptions.map((option) => ({
                  value: `environment:${option.id}`,
                  label: option.label,
                  description: "Computer",
                })),
                ...projectOptions.map((option) => ({
                  value: `project:${option.id}`,
                  label: option.label,
                  description: "Project",
                })),
              ]}
              ariaLabel="Environment"
              fullWidth
              popupClassName="is-minimal"
              onValueChange={(value) => setBindingForm((current) => ({ ...current, environment: value }))}
            />
          </label>
          <fieldset className="external-agent-triggers__checks">
            <legend>Allowed triggers</legend>
            {(["mention", "assignment", "command"] as const).map((trigger) => (
              <label key={trigger}>
                <PlatformCheckbox
                  aria-label={`Allow ${trigger}`}
                  checked={bindingForm.triggerModes.includes(trigger)}
                  onClick={() => setBindingForm((current) => ({
                    ...current,
                    triggerModes: current.triggerModes.includes(trigger)
                      ? current.triggerModes.filter((item) => item !== trigger)
                      : [...current.triggerModes, trigger],
                  }))}
                />
                <span>{trigger.charAt(0).toUpperCase() + trigger.slice(1)}</span>
              </label>
            ))}
          </fieldset>
          <label className="external-agent-triggers__field">
            <span>Requester permissions</span>
            <PlatformSelector
              value={bindingForm.permissionMode}
              options={[
                {
                  value: "linked_member",
                  label: "Linked organization member",
                  description: "Recommended. Enforce the mapped member's organization access.",
                },
                {
                  value: "external_requester",
                  label: "Allowed external requester",
                  description: "Permit only explicitly allowlisted provider users.",
                },
              ]}
              ariaLabel="Requester permissions"
              fullWidth
              popupClassName="is-minimal"
              onValueChange={(value) => setBindingForm((current) => ({ ...current, permissionMode: value }))}
            />
          </label>
          {bindingForm.permissionMode === "external_requester" ? (
            <TextField
              label={`Allowed ${terms.providerUser.toLowerCase()}s`}
              value={bindingForm.allowedExternalUserIds}
              placeholder="user-id-1, user-id-2"
              description="Comma-separated allowlist. External requesters never inherit organization-member permissions."
              onChange={(value) => setBindingForm((current) => ({ ...current, allowedExternalUserIds: value }))}
            />
          ) : null}
        </div>
      </PlatformModal>

      <PlatformModal
        open={identityModalOpen}
        title="Map provider identity"
        size="small"
        onClose={() => !busy && setIdentityModalOpen(false)}
        closeButtonDisabled={busy}
        footer={
          <>
            <PlatformSecondaryButton size="medium" onClick={() => setIdentityModalOpen(false)} disabled={busy}>
              Cancel
            </PlatformSecondaryButton>
            <PlatformPrimaryButton
              size="medium"
              disabled={!identityForm.installationId || !identityForm.providerUserId.trim() || !identityForm.platformUserId || busy}
              onClick={() => void runMutation(async () => {
                await client.createIdentity({
                  installationId: identityForm.installationId,
                  providerUserId: identityForm.providerUserId.trim(),
                  platformUserId: identityForm.platformUserId,
                  displayName: identityForm.displayName.trim(),
                  email: identityForm.email.trim(),
                });
                setIdentityModalOpen(false);
              }, "Identity mapping saved.")}
            >
              Save mapping
            </PlatformPrimaryButton>
          </>
        }
      >
        <div className="external-agent-triggers__form">
          <label className="external-agent-triggers__field">
            <span>Webhook installation</span>
            <PlatformSelector
              value={identityForm.installationId}
              options={installations.map((item) => ({ value: item.id, label: item.displayName }))}
              ariaLabel="Webhook installation"
              fullWidth
              popupClassName="is-minimal"
              onValueChange={(value) => setIdentityForm((current) => ({ ...current, installationId: value }))}
            />
          </label>
          <TextField
            label={terms.providerUser}
            value={identityForm.providerUserId}
            required
            onChange={(value) => setIdentityForm((current) => ({ ...current, providerUserId: value }))}
          />
          <label className="external-agent-triggers__field">
            <span>Organization member</span>
            <PlatformSelector
              value={identityForm.platformUserId}
              options={members.map((member) => ({
                value: member.id,
                label: <MemberOption member={member} />,
                description: member.email,
              }))}
              ariaLabel="Organization member"
              fullWidth
              popupClassName="is-minimal"
              onValueChange={(value) => setIdentityForm((current) => ({ ...current, platformUserId: value }))}
            />
          </label>
          <TextField
            label="Provider display name"
            value={identityForm.displayName}
            onChange={(value) => setIdentityForm((current) => ({ ...current, displayName: value }))}
          />
          <TextField
            label="Provider email"
            value={identityForm.email}
            onChange={(value) => setIdentityForm((current) => ({ ...current, email: value }))}
          />
        </div>
      </PlatformModal>

      <SetupModal setup={setup} provider={provider} onClose={() => setSetup(null)} />

      <PlatformModal
        open={Boolean(confirmState)}
        title={confirmState?.title || "Confirm action"}
        description={confirmState?.description}
        size="small"
        role="alertdialog"
        onClose={() => !busy && setConfirmState(null)}
        closeButtonDisabled={busy}
        footer={
          <>
            <PlatformSecondaryButton size="medium" onClick={() => setConfirmState(null)} disabled={busy}>
              Cancel
            </PlatformSecondaryButton>
            <PlatformPrimaryButton
              size="medium"
              disabled={busy}
              onClick={() => {
                const confirmation = confirmState;
                if (!confirmation) return;
                void runMutation(async () => {
                  await confirmation.run();
                  setConfirmState(null);
                }, "Changes saved.");
              }}
            >
              {confirmState?.actionLabel || "Continue"}
            </PlatformPrimaryButton>
          </>
        }
      />
    </div>
  );
}

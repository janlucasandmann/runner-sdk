import {
  CheckCircle2,
  KeyRound,
  Link2,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Trash2,
  Unplug,
} from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { useEffect, useMemo, useState } from "react";
import {
  PlatformDataTable,
  type PlatformDataTableAction,
  type PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import {
  PlatformConfirmationModal,
  PlatformModal,
} from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import {
  ORGANIZATION_SAFE_IDENTITY_ROLE_OPTIONS,
  formatOrganizationAccessDate,
  formatOrganizationAccessLabel,
} from "./organization-access-constants.js";
import {
  OrganizationAccessField,
  OrganizationAccessIdentity,
  OrganizationAccessNotice,
  OrganizationAccessStatusLabel,
} from "./organization-access-presentation.js";
import type { OrganizationAccessRepository } from "./organization-access-repository.js";
import type {
  OrganizationAccessTeam,
  OrganizationIdentityConnection,
  OrganizationIdentityConnectionInput,
  OrganizationIdentityGroupMapping,
  OrganizationIdentityGroupMappingInput,
  OrganizationIdentityProvider,
  OrganizationScimToken,
} from "./organization-access-types.js";

interface OrganizationIdentityProvidersPanelProps {
  repository: OrganizationAccessRepository;
  connections: readonly OrganizationIdentityConnection[];
  teams: readonly OrganizationAccessTeam[];
  loading: boolean;
  canManage: boolean;
  onConnectionsChange: (connections: OrganizationIdentityConnection[]) => void;
  onReload: () => Promise<void>;
  onError: (message: string) => void;
}

interface ConnectionDraft extends OrganizationIdentityConnectionInput {
  id: string;
}

const EMPTY_CONNECTION_DRAFT: ConnectionDraft = {
  id: "",
  provider: "entra",
  displayName: "",
  issuer: "",
  tenantId: "",
  clientId: "",
  discoveryUrl: "",
  defaultMemberRole: "member",
  claimMappings: {
    subject: "sub",
    email: "email",
    displayName: "name",
    groups: "groups",
  },
};

function connectionToDraft(
  connection: OrganizationIdentityConnection,
): ConnectionDraft {
  return {
    id: connection.id,
    provider: connection.provider,
    displayName: connection.displayName,
    issuer: connection.issuer,
    tenantId: connection.tenantId,
    clientId: connection.clientId,
    discoveryUrl: connection.discoveryUrl,
    defaultMemberRole:
      connection.defaultMemberRole === "viewer" ||
      connection.defaultMemberRole === "developer"
        ? connection.defaultMemberRole
        : "member",
    claimMappings: { ...connection.claimMappings },
  };
}

function providerIcon(provider: OrganizationIdentityProvider) {
  return provider === "entra" ? ShieldCheck : Link2;
}

function connectionInputFromDraft(
  draft: ConnectionDraft,
): OrganizationIdentityConnectionInput {
  const input: OrganizationIdentityConnectionInput = {
    provider: draft.provider,
    displayName: draft.displayName.trim(),
    clientId: draft.clientId.trim(),
    defaultMemberRole: draft.defaultMemberRole,
    claimMappings: {
      subject: draft.claimMappings?.subject?.trim() || "sub",
      email: draft.claimMappings?.email?.trim() || "email",
      displayName: draft.claimMappings?.displayName?.trim() || "name",
      groups: draft.claimMappings?.groups?.trim() || "groups",
    },
  };
  if (draft.provider === "entra") {
    input.tenantId = draft.tenantId?.trim();
  } else {
    input.issuer = draft.issuer?.trim();
  }
  if (draft.discoveryUrl?.trim()) {
    input.discoveryUrl = draft.discoveryUrl.trim();
  }
  return input;
}

export function OrganizationIdentityProvidersPanel({
  repository,
  connections,
  teams,
  loading,
  canManage,
  onConnectionsChange,
  onReload,
  onError,
}: OrganizationIdentityProvidersPanelProps) {
  const [draft, setDraft] = useState<ConnectionDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [mappingConnection, setMappingConnection] =
    useState<OrganizationIdentityConnection | null>(null);
  const [mappings, setMappings] = useState<OrganizationIdentityGroupMapping[]>(
    [],
  );
  const [mappingsLoading, setMappingsLoading] = useState(false);
  const [mappingDraft, setMappingDraft] =
    useState<OrganizationIdentityGroupMappingInput | null>(null);
  const [scimToken, setScimToken] = useState<OrganizationScimToken | null>(null);
  const [confirmation, setConfirmation] = useState<{
    type: "disable" | "revoke-scim" | "delete-mapping";
    connection: OrganizationIdentityConnection;
    mapping?: OrganizationIdentityGroupMapping;
  } | null>(null);

  useEffect(() => {
    if (!mappingConnection) return;
    let active = true;
    setMappingsLoading(true);
    repository
      .listGroupMappings(mappingConnection.id)
      .then((rows) => {
        if (active) setMappings(rows);
      })
      .catch((error) => {
        if (active) {
          onError(
            error instanceof Error
              ? error.message
              : "Failed to load group mappings.",
          );
        }
      })
      .finally(() => {
        if (active) setMappingsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [mappingConnection, onError, repository]);

  const columns = useMemo<PlatformDataTableColumn<OrganizationIdentityConnection>[]>(
    () => [
      {
        id: "provider",
        header: "Provider",
        accessor: "displayName",
        sortable: true,
        width: "minmax(220px, 1.25fr)",
        cell: ({ row }) => (
          <OrganizationAccessIdentity
            label={row.displayName}
            detail={row.provider === "entra" ? "Microsoft Entra" : "OpenID Connect"}
          />
        ),
      },
      {
        id: "status",
        header: "Status",
        accessor: "status",
        sortable: true,
        width: "minmax(110px, .55fr)",
        cell: ({ row }) => <OrganizationAccessStatusLabel status={row.status} />,
      },
      {
        id: "role",
        header: "Default role",
        accessor: "defaultMemberRole",
        sortable: true,
        width: "minmax(120px, .62fr)",
        cell: ({ row }) => formatOrganizationAccessLabel(row.defaultMemberRole),
      },
      {
        id: "scim",
        header: "SCIM",
        accessor: (row) => (row.scimTokenPrefix ? 1 : 0),
        sortable: true,
        width: "minmax(100px, .5fr)",
        cell: ({ row }) => (row.scimTokenPrefix ? "Configured" : "Not configured"),
      },
      {
        id: "updated",
        header: "Updated",
        accessor: (row) => Date.parse(row.updatedAt || "") || 0,
        sortable: true,
        sortDescFirst: true,
        align: "end",
        width: "minmax(150px, .72fr)",
        cell: ({ row }) => formatOrganizationAccessDate(row.updatedAt),
      },
    ],
    [],
  );

  const updateConnectionInList = (
    connection: OrganizationIdentityConnection,
  ) => {
    onConnectionsChange(
      connections.some((item) => item.id === connection.id)
        ? connections.map((item) => (item.id === connection.id ? connection : item))
        : [connection, ...connections],
    );
  };

  const validateConnection = async (
    connection: OrganizationIdentityConnection,
  ) => {
    setActionId(`validate:${connection.id}`);
    setValidationMessage("");
    try {
      const validation = await repository.validateConnection(connection.id);
      setValidationMessage(
        validation.valid === false
          ? validation.error || `${connection.displayName} validation failed.`
          : `${connection.displayName} discovery metadata is valid.`,
      );
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Identity validation failed.",
      );
    } finally {
      setActionId("");
    }
  };

  const rotateScimToken = async (
    connection: OrganizationIdentityConnection,
  ) => {
    setActionId(`scim:${connection.id}`);
    try {
      const token = await repository.rotateScimToken(connection.id);
      setScimToken(token);
      await onReload();
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Failed to rotate SCIM token.",
      );
    } finally {
      setActionId("");
    }
  };

  const getRowActions = (
    connection: OrganizationIdentityConnection,
  ): readonly PlatformDataTableAction<OrganizationIdentityConnection>[] => [
    {
      id: "edit",
      label: "Edit connection",
      icon: Settings2,
      disabled: !canManage,
      onSelect: () => setDraft(connectionToDraft(connection)),
    },
    {
      id: "mappings",
      label: "Group mappings",
      icon: Link2,
      onSelect: () => setMappingConnection(connection),
    },
    {
      id: "validate",
      label: actionId === `validate:${connection.id}` ? "Validating..." : "Validate discovery",
      icon: CheckCircle2,
      disabled: !canManage || Boolean(actionId),
      onSelect: () => void validateConnection(connection),
    },
    {
      id: "rotate-scim",
      label: connection.scimTokenPrefix ? "Rotate SCIM token" : "Create SCIM token",
      icon: RefreshCw,
      disabled: !canManage || Boolean(actionId),
      onSelect: () => void rotateScimToken(connection),
    },
    {
      id: "revoke-scim",
      label: "Revoke SCIM token",
      icon: KeyRound,
      hidden: !connection.scimTokenPrefix,
      disabled: !canManage || Boolean(actionId),
      onSelect: () =>
        setConfirmation({ type: "revoke-scim", connection }),
    },
    {
      id: connection.status === "active" ? "disable" : "enable",
      label: connection.status === "active" ? "Disable connection" : "Enable connection",
      icon: connection.status === "active" ? Unplug : ShieldCheck,
      disabled: !canManage || Boolean(actionId),
      onSelect: () => {
        if (connection.status === "active") {
          setConfirmation({ type: "disable", connection });
        } else {
          setActionId(`enable:${connection.id}`);
          void repository
            .updateConnection(connection.id, { status: "active" })
            .then(updateConnectionInList)
            .catch((error) =>
              onError(
                error instanceof Error
                  ? error.message
                  : "Failed to enable identity connection.",
              ),
            )
            .finally(() => setActionId(""));
        }
      },
    },
  ];

  const saveConnection = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const input = connectionInputFromDraft(draft);
      const connection = draft.id
        ? await repository.updateConnection(draft.id, input)
        : await repository.createConnection(input);
      updateConnectionInList(connection);
      setDraft(null);
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Failed to save identity connection.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveMapping = async () => {
    if (!mappingConnection || !mappingDraft) return;
    setSaving(true);
    try {
      const mapping = await repository.saveGroupMapping(
        mappingConnection.id,
        mappingDraft,
      );
      setMappings((current) =>
        current.some((item) => item.id === mapping.id)
          ? current.map((item) => (item.id === mapping.id ? mapping : item))
          : [mapping, ...current],
      );
      setMappingDraft(null);
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "Failed to save group mapping.",
      );
    } finally {
      setSaving(false);
    }
  };

  const mappingColumns = useMemo<
    PlatformDataTableColumn<OrganizationIdentityGroupMapping>[]
  >(
    () => [
      {
        id: "externalGroup",
        header: "External group",
        accessor: (row) => row.externalGroupName || row.externalGroupId,
        sortable: true,
        width: "minmax(210px, 1.15fr)",
        cell: ({ row }) => (
          <span className="organization-access-control__stacked-value">
            <span>{row.externalGroupName || row.externalGroupId}</span>
            {row.externalGroupName ? <small>{row.externalGroupId}</small> : null}
          </span>
        ),
      },
      {
        id: "team",
        header: "Team",
        accessor: (row) =>
          teams.find((team) => team.id === row.teamId)?.name || "",
        sortable: true,
        width: "minmax(140px, .75fr)",
        cell: ({ row }) =>
          teams.find((team) => team.id === row.teamId)?.name || "—",
      },
      {
        id: "role",
        header: "Organization role",
        accessor: "organizationRole",
        sortable: true,
        width: "minmax(140px, .72fr)",
        cell: ({ row }) =>
          row.organizationRole
            ? formatOrganizationAccessLabel(row.organizationRole)
            : "—",
      },
    ],
    [teams],
  );

  const closeProviderModal = () => {
    if (!saving) setDraft(null);
  };

  return (
    <>
      {validationMessage ? (
        <OrganizationAccessNotice
          tone={validationMessage.toLowerCase().includes("valid") ? "success" : "neutral"}
        >
          {validationMessage}
        </OrganizationAccessNotice>
      ) : null}
      <PlatformDataTable
        rows={connections}
        columns={columns}
        getRowId={(row) => row.id}
        ariaLabel="Organization identity providers"
        variant="minimalistic-ui"
        surface="default"
        pagination={false}
        loading={loading}
        sorting={{ defaultValue: { id: "updated", direction: "desc" } }}
        toolbar={{
          title: "Identity Providers",
          search: {
            placeholder: "Search identity providers",
            getSearchText: (row) =>
              `${row.displayName} ${row.provider} ${row.issuer} ${row.status}`,
          },
          primaryAction: canManage
            ? {
                label: "Identity Provider",
                icon: Plus,
                onClick: () => setDraft({ ...EMPTY_CONNECTION_DRAFT }),
              }
            : undefined,
        }}
        onRowActivate={(connection) => {
          if (canManage) setDraft(connectionToDraft(connection));
          else setMappingConnection(connection);
        }}
        getRowAriaLabel={(connection) => connection.displayName}
        getRowActions={getRowActions}
        emptyState="No enterprise identity providers are connected."
        noResultsState="No identity providers match this search."
      />

      <PlatformModal
        open={Boolean(draft)}
        title={draft?.id ? "Edit identity provider" : "Connect identity provider"}
        description="Configure trusted OIDC discovery and safe just-in-time membership defaults."
        size="medium"
        scrollable
        onClose={closeProviderModal}
        closeButtonDisabled={saving}
        footer={
          <>
            <PlatformSecondaryButton
              size="medium"
              onClick={closeProviderModal}
              disabled={saving}
            >
              Cancel
            </PlatformSecondaryButton>
            <PlatformPrimaryButton
              size="medium"
              onClick={() => void saveConnection()}
              disabled={
                saving ||
                !draft?.displayName.trim() ||
                !draft?.clientId.trim() ||
                (draft?.provider === "entra"
                  ? !draft.tenantId?.trim()
                  : !draft?.issuer?.trim())
              }
            >
              {saving ? "Saving..." : "Save Connection"}
            </PlatformPrimaryButton>
          </>
        }
      >
        {draft ? (
          <div className="organization-access-control__form">
            <div className="organization-access-control__form-grid">
              <OrganizationAccessField label="Provider">
                <PlatformSelector
                  value={draft.provider}
                  options={[
                    { value: "entra", label: "Microsoft Entra" },
                    { value: "oidc", label: "OpenID Connect" },
                  ]}
                  onValueChange={(provider) =>
                    setDraft((current) =>
                      current ? { ...current, provider } : current,
                    )
                  }
                  ariaLabel="Identity provider type"
                  fullWidth
                  disabled={Boolean(draft.id)}
                />
              </OrganizationAccessField>
              <OrganizationAccessField label="Display name">
                <input
                  className="organization-access-control__input"
                  value={draft.displayName}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, displayName: event.target.value }
                        : current,
                    )
                  }
                  autoFocus
                  placeholder="Company identity"
                />
              </OrganizationAccessField>
              {draft.provider === "entra" ? (
                <OrganizationAccessField label="Tenant ID">
                  <input
                    className="organization-access-control__input"
                    value={draft.tenantId || ""}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? { ...current, tenantId: event.target.value }
                          : current,
                      )
                    }
                    placeholder="00000000-0000-0000-0000-000000000000"
                  />
                </OrganizationAccessField>
              ) : (
                <OrganizationAccessField label="Issuer URL">
                  <input
                    className="organization-access-control__input"
                    value={draft.issuer || ""}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? { ...current, issuer: event.target.value }
                          : current,
                      )
                    }
                    placeholder="https://identity.example.com"
                  />
                </OrganizationAccessField>
              )}
              <OrganizationAccessField label="Client ID">
                <input
                  className="organization-access-control__input"
                  value={draft.clientId}
                  onChange={(event) =>
                    setDraft((current) =>
                      current ? { ...current, clientId: event.target.value } : current,
                    )
                  }
                  placeholder="Application client ID"
                />
              </OrganizationAccessField>
              <OrganizationAccessField
                label="Default member role"
                description="Governance roles cannot be granted through JIT provisioning."
              >
                <PlatformSelector
                  value={draft.defaultMemberRole}
                  options={ORGANIZATION_SAFE_IDENTITY_ROLE_OPTIONS}
                  onValueChange={(defaultMemberRole) =>
                    setDraft((current) =>
                      current ? { ...current, defaultMemberRole } : current,
                    )
                  }
                  ariaLabel="Default provisioned member role"
                  fullWidth
                />
              </OrganizationAccessField>
              <OrganizationAccessField
                label="Discovery URL"
                description="Leave empty to derive it from the issuer."
              >
                <input
                  className="organization-access-control__input"
                  value={draft.discoveryUrl || ""}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, discoveryUrl: event.target.value }
                        : current,
                    )
                  }
                  placeholder="https://…/.well-known/openid-configuration"
                />
              </OrganizationAccessField>
            </div>
            <div className="organization-access-control__subsection">
              <h3>Claim mappings</h3>
              <p>Map trusted provider claims to platform identity fields.</p>
              <div className="organization-access-control__claim-grid">
                {(
                  [
                    ["subject", "Subject"],
                    ["email", "Email"],
                    ["displayName", "Display name"],
                    ["groups", "Groups"],
                  ] as const
                ).map(([key, label]) => (
                  <OrganizationAccessField key={key} label={label}>
                    <input
                      className="organization-access-control__input"
                      value={draft.claimMappings?.[key] || ""}
                      onChange={(event) =>
                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                claimMappings: {
                                  ...current.claimMappings,
                                  [key]: event.target.value,
                                },
                              }
                            : current,
                        )
                      }
                    />
                  </OrganizationAccessField>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </PlatformModal>

      <PlatformModal
        open={Boolean(mappingConnection)}
        title={
          mappingDraft
            ? "Add group mapping"
            : `${mappingConnection?.displayName || "Identity provider"} mappings`
        }
        description={
          mappingDraft
            ? "Map one immutable external group ID to a team, a safe organization role, or both."
            : "External group claims reconcile identity-managed memberships without changing manual access."
        }
        size="medium"
        scrollable
        onClose={() => {
          if (saving) return;
          if (mappingDraft) setMappingDraft(null);
          else setMappingConnection(null);
        }}
        closeButtonDisabled={saving}
        footer={
          mappingDraft ? (
            <>
              <PlatformSecondaryButton
                size="medium"
                onClick={() => setMappingDraft(null)}
                disabled={saving}
              >
                Back
              </PlatformSecondaryButton>
              <PlatformPrimaryButton
                size="medium"
                onClick={() => void saveMapping()}
                disabled={
                  saving ||
                  !mappingDraft.externalGroupId.trim() ||
                  (!mappingDraft.teamId && !mappingDraft.organizationRole)
                }
              >
                {saving ? "Saving..." : "Save Mapping"}
              </PlatformPrimaryButton>
            </>
          ) : undefined
        }
      >
        {mappingConnection && mappingDraft ? (
          <div className="organization-access-control__form">
            <OrganizationAccessField label="External group ID">
              <input
                className="organization-access-control__input"
                value={mappingDraft.externalGroupId}
                onChange={(event) =>
                  setMappingDraft((current) =>
                    current
                      ? { ...current, externalGroupId: event.target.value }
                      : current,
                  )
                }
                autoFocus
                placeholder="Immutable provider group ID"
              />
            </OrganizationAccessField>
            <OrganizationAccessField label="Display name">
              <input
                className="organization-access-control__input"
                value={mappingDraft.externalGroupName || ""}
                onChange={(event) =>
                  setMappingDraft((current) =>
                    current
                      ? { ...current, externalGroupName: event.target.value }
                      : current,
                  )
                }
                placeholder="Engineering"
              />
            </OrganizationAccessField>
            <div className="organization-access-control__form-grid">
              <OrganizationAccessField label="Team">
                <PlatformSelector
                  value={mappingDraft.teamId || ""}
                  options={[
                    { value: "", label: "No team" },
                    ...teams.map((team) => ({
                      value: team.id,
                      label: team.name,
                      leading: (
                        <OrganizationAccessIdentity
                          label={team.name}
                          imageUrl={team.profileImageUrl}
                        />
                      ),
                    })),
                  ]}
                  onValueChange={(teamId) =>
                    setMappingDraft((current) =>
                      current ? { ...current, teamId } : current,
                    )
                  }
                  ariaLabel="Mapped team"
                  fullWidth
                />
              </OrganizationAccessField>
              <OrganizationAccessField label="Organization role">
                <PlatformSelector
                  value={mappingDraft.organizationRole || ""}
                  options={[
                    { value: "", label: "No organization role" },
                    ...ORGANIZATION_SAFE_IDENTITY_ROLE_OPTIONS,
                  ]}
                  onValueChange={(organizationRole) =>
                    setMappingDraft((current) =>
                      current ? { ...current, organizationRole } : current,
                    )
                  }
                  ariaLabel="Mapped organization role"
                  fullWidth
                />
              </OrganizationAccessField>
            </div>
          </div>
        ) : mappingConnection ? (
          <PlatformDataTable
            rows={mappings}
            columns={mappingColumns}
            getRowId={(row) => row.id}
            ariaLabel={`${mappingConnection.displayName} group mappings`}
            variant="minimalistic-ui"
            surface="plain"
            pagination={false}
            loading={mappingsLoading}
            toolbar={{
              search: {
                placeholder: "Search group mappings",
                getSearchText: (row) =>
                  `${row.externalGroupName} ${row.externalGroupId} ${row.teamId} ${row.organizationRole}`,
              },
              primaryAction: canManage
                ? {
                    label: "Group Mapping",
                    icon: Plus,
                    onClick: () =>
                      setMappingDraft({
                        externalGroupId: "",
                        externalGroupName: "",
                        teamId: "",
                        organizationRole: "",
                      }),
                  }
                : undefined,
            }}
            getRowActions={(mapping) => [
              {
                id: "delete",
                label: "Delete mapping",
                icon: Trash2,
                danger: true,
                disabled: !canManage,
                onSelect: () =>
                  setConfirmation({
                    type: "delete-mapping",
                    connection: mappingConnection,
                    mapping,
                  }),
              },
            ]}
            emptyState="No external groups are mapped yet."
            noResultsState="No group mappings match this search."
          />
        ) : null}
      </PlatformModal>

      <PlatformModal
        open={Boolean(scimToken)}
        title="Store this SCIM token now"
        description="The token is shown once and cannot be retrieved after this dialog closes."
        size="small"
        onClose={() => setScimToken(null)}
        footer={
          <>
            <PlatformSecondaryButton
              size="medium"
              onClick={() =>
                void navigator.clipboard?.writeText(scimToken?.token || "")
              }
            >
              Copy Token
            </PlatformSecondaryButton>
            <PlatformPrimaryButton
              size="medium"
              onClick={() => setScimToken(null)}
            >
              I Stored It
            </PlatformPrimaryButton>
          </>
        }
      >
        {scimToken ? (
          <code className="organization-access-control__secret">
            {scimToken.token}
          </code>
        ) : null}
      </PlatformModal>

      <PlatformConfirmationModal
        open={Boolean(confirmation)}
        title={
          confirmation?.type === "delete-mapping"
            ? "Delete group mapping?"
            : confirmation?.type === "revoke-scim"
              ? "Revoke SCIM token?"
              : "Disable identity connection?"
        }
        description={
          confirmation?.type === "delete-mapping"
            ? "Future provider sign-ins will no longer reconcile this group assignment."
            : confirmation?.type === "revoke-scim"
              ? "The identity provider will immediately lose SCIM access."
              : "New SSO and identity-managed provisioning through this connection will stop."
        }
        confirmLabel={
          confirmation?.type === "delete-mapping"
            ? "Delete Mapping"
            : confirmation?.type === "revoke-scim"
              ? "Revoke Token"
              : "Disable Connection"
        }
        confirmingLabel="Working..."
        tone="destructive"
        onCancel={() => setConfirmation(null)}
        onConfirm={async () => {
          if (!confirmation) return;
          if (confirmation.type === "delete-mapping" && confirmation.mapping) {
            await repository.deleteGroupMapping(
              confirmation.connection.id,
              confirmation.mapping.id,
            );
            setMappings((current) =>
              current.filter((item) => item.id !== confirmation.mapping?.id),
            );
          } else if (confirmation.type === "revoke-scim") {
            await repository.revokeScimToken(confirmation.connection.id);
            await onReload();
          } else {
            const connection = await repository.disableConnection(
              confirmation.connection.id,
            );
            updateConnectionInList(connection);
          }
          setConfirmation(null);
        }}
      />
    </>
  );
}

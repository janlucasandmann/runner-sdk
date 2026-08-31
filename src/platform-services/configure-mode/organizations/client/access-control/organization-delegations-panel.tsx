import { Plus, ShieldOff } from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { useMemo, useState } from "react";
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
import { PlatformCheckbox } from "../../../../../platform-ui/components/ui/checkbox/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import {
  ORGANIZATION_ACCESS_RESOURCE_ACTIONS,
  ORGANIZATION_ACCESS_RESOURCE_TYPE_OPTIONS,
  formatOrganizationAccessDate,
  formatOrganizationAccessLabel,
} from "./organization-access-constants.js";
import {
  OrganizationAccessField,
  OrganizationAccessIdentity,
  OrganizationAccessStatusLabel,
} from "./organization-access-presentation.js";
import type { OrganizationAccessRepository } from "./organization-access-repository.js";
import type {
  AuthorizationDelegationStatus,
  OrganizationAccessAgent,
  OrganizationAccessResource,
  OrganizationAuthorizationDelegation,
} from "./organization-access-types.js";

interface OrganizationDelegationsPanelProps {
  repository: OrganizationAccessRepository;
  delegations: readonly OrganizationAuthorizationDelegation[];
  agents: readonly OrganizationAccessAgent[];
  resources: readonly OrganizationAccessResource[];
  loading: boolean;
  canManage: boolean;
  onDelegationsChange: (
    delegations: OrganizationAuthorizationDelegation[],
  ) => void;
  onError: (message: string) => void;
}

interface DelegationDraft {
  agentId: string;
  resourceType: string;
  resourceId: string;
  allowedActions: string[];
  expiresAt: string;
}

function toLocalDateTime(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function createDelegationDraft(
  agents: readonly OrganizationAccessAgent[],
  resources: readonly OrganizationAccessResource[],
): DelegationDraft {
  const resourceType =
    resources.find((resource) => resource.type)?.type || "project";
  const resourceId =
    resources.find((resource) => resource.type === resourceType)?.id || "";
  return {
    agentId: agents[0]?.id || "",
    resourceType,
    resourceId,
    allowedActions: [],
    expiresAt: toLocalDateTime(new Date(Date.now() + 60 * 60 * 1000)),
  };
}

export function OrganizationDelegationsPanel({
  repository,
  delegations,
  agents,
  resources,
  loading,
  canManage,
  onDelegationsChange,
  onError,
}: OrganizationDelegationsPanelProps) {
  const [statusFilter, setStatusFilter] = useState<
    AuthorizationDelegationStatus | "all"
  >("active");
  const [draft, setDraft] = useState<DelegationDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [revoking, setRevoking] =
    useState<OrganizationAuthorizationDelegation | null>(null);
  const filteredDelegations = useMemo(
    () =>
      statusFilter === "all"
        ? delegations
        : delegations.filter(
            (delegation) => delegation.status === statusFilter,
          ),
    [delegations, statusFilter],
  );

  const columns = useMemo<
    PlatformDataTableColumn<OrganizationAuthorizationDelegation>[]
  >(
    () => [
      {
        id: "agent",
        header: "Agent",
        accessor: "delegatePrincipalId",
        sortable: true,
        width: "minmax(190px, 1fr)",
        cell: ({ row }) => {
          const agent = agents.find(
            (candidate) =>
              candidate.id === row.delegatePrincipalId ||
              candidate.id === row.agentId,
          );
          return (
            <OrganizationAccessIdentity
              label={agent?.name || row.delegatePrincipalId}
              detail={row.agentVersionId ? `Version ${row.agentVersionId}` : "Agent"}
              imageUrl={agent?.profileImageUrl}
            />
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        accessor: (row) => row.allowedActions.join(" "),
        sortable: true,
        width: "minmax(210px, 1.1fr)",
        cell: ({ row }) =>
          row.allowedActions.length
            ? `${row.allowedActions.length} action${row.allowedActions.length === 1 ? "" : "s"}`
            : "—",
      },
      {
        id: "resources",
        header: "Resources",
        accessor: (row) => row.resourceConstraints.ids.join(" "),
        sortable: true,
        width: "minmax(220px, 1.12fr)",
        cell: ({ row }) => (
          <span className="organization-access-control__stacked-value">
            <span>
              {row.resourceConstraints.ids.length} resource
              {row.resourceConstraints.ids.length === 1 ? "" : "s"}
            </span>
            <small>
              {row.resourceConstraints.types
                .map(formatOrganizationAccessLabel)
                .join(", ")}
            </small>
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessor: "status",
        sortable: true,
        width: "minmax(105px, .5fr)",
        cell: ({ row }) => <OrganizationAccessStatusLabel status={row.status} />,
      },
      {
        id: "expires",
        header: "Expires",
        accessor: (row) => Date.parse(row.expiresAt || "") || 0,
        sortable: true,
        align: "end",
        width: "minmax(155px, .72fr)",
        cell: ({ row }) => formatOrganizationAccessDate(row.expiresAt),
      },
    ],
    [agents],
  );

  const getRowActions = (
    delegation: OrganizationAuthorizationDelegation,
  ): readonly PlatformDataTableAction<OrganizationAuthorizationDelegation>[] =>
    delegation.status === "active"
      ? [
          {
            id: "revoke",
            label: "Revoke delegation",
            icon: ShieldOff,
            danger: true,
            disabled: !canManage,
            onSelect: () => setRevoking(delegation),
          },
        ]
      : [];

  const availableResources = useMemo(
    () =>
      resources.filter(
        (resource) =>
          resource.type === draft?.resourceType ||
          (draft?.resourceType === "server" &&
            [
              "web_app",
              "function",
              "auth",
              "secrets",
              "payments",
              "agent_runtime",
              "server",
            ].includes(resource.type)),
      ),
    [draft?.resourceType, resources],
  );
  const availableActions =
    ORGANIZATION_ACCESS_RESOURCE_ACTIONS[draft?.resourceType || ""] || [];

  const saveDelegation = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const agent = agents.find((candidate) => candidate.id === draft.agentId);
      const delegation = await repository.createDelegation({
        delegatePrincipalId: draft.agentId,
        agentVersionId: agent?.versionId || undefined,
        allowedActions: draft.allowedActions,
        resourceConstraints: {
          types: [draft.resourceType],
          ids: [draft.resourceId],
        },
        expiresAt: new Date(draft.expiresAt).toISOString(),
      });
      onDelegationsChange([delegation, ...delegations]);
      setDraft(null);
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Failed to create agent delegation.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PlatformDataTable
        rows={filteredDelegations}
        columns={columns}
        getRowId={(row) => row.id}
        ariaLabel="Agent authorization delegations"
        variant="minimalistic-ui"
        surface="default"
        pagination={false}
        loading={loading}
        sorting={{ defaultValue: { id: "expires", direction: "asc" } }}
        toolbar={{
          title: "Agent Delegations",
          search: {
            placeholder: "Search agent delegations",
            getSearchText: (row) =>
              `${row.delegatePrincipalId} ${row.allowedActions.join(" ")} ${row.resourceConstraints.types.join(" ")} ${row.resourceConstraints.ids.join(" ")} ${row.status}`,
          },
          filters: [
            {
              id: "status",
              label: "Status",
              value: statusFilter,
              onChange: (value) =>
                setStatusFilter(
                  value as AuthorizationDelegationStatus | "all",
                ),
              options: [
                { id: "all", label: "All Delegations" },
                { id: "active", label: "Active" },
                { id: "revoked", label: "Revoked" },
                { id: "expired", label: "Expired" },
              ],
            },
          ],
          primaryAction: canManage
            ? {
                label: "Delegation",
                icon: Plus,
                onClick: () =>
                  setDraft(createDelegationDraft(agents, resources)),
                disabled: agents.length === 0,
              }
            : undefined,
        }}
        getRowActions={getRowActions}
        emptyState="No agent delegations have been issued."
        noResultsState="No delegations match this view."
      />

      <PlatformModal
        open={Boolean(draft)}
        title="Delegate resource access"
        description="Grant one agent the minimum actions it needs on one resource for no more than 24 hours."
        size="medium"
        scrollable
        onClose={() => {
          if (!saving) setDraft(null);
        }}
        closeButtonDisabled={saving}
        footer={
          <>
            <PlatformSecondaryButton
              size="medium"
              onClick={() => setDraft(null)}
              disabled={saving}
            >
              Cancel
            </PlatformSecondaryButton>
            <PlatformPrimaryButton
              size="medium"
              onClick={() => void saveDelegation()}
              disabled={
                saving ||
                !draft?.agentId ||
                !draft?.resourceType ||
                !draft?.resourceId ||
                !draft?.expiresAt ||
                draft.allowedActions.length === 0
              }
            >
              {saving ? "Creating..." : "Create Delegation"}
            </PlatformPrimaryButton>
          </>
        }
      >
        {draft ? (
          <div className="organization-access-control__form">
            <div className="organization-access-control__form-grid">
              <OrganizationAccessField label="Agent">
                <PlatformSelector
                  value={draft.agentId}
                  options={agents.map((agent) => ({
                    value: agent.id,
                    label: agent.name,
                    leading: (
                      <OrganizationAccessIdentity
                        label={agent.name}
                        imageUrl={agent.profileImageUrl}
                      />
                    ),
                  }))}
                  onValueChange={(agentId) =>
                    setDraft((current) =>
                      current ? { ...current, agentId } : current,
                    )
                  }
                  ariaLabel="Delegated agent"
                  fullWidth
                  emptyContent="No agents are available in this organization."
                />
              </OrganizationAccessField>
              <OrganizationAccessField label="Expires">
                <input
                  className="organization-access-control__input"
                  type="datetime-local"
                  min={toLocalDateTime(new Date(Date.now() + 60_000))}
                  max={toLocalDateTime(
                    new Date(Date.now() + 24 * 60 * 60 * 1000),
                  )}
                  value={draft.expiresAt}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, expiresAt: event.target.value }
                        : current,
                    )
                  }
                />
              </OrganizationAccessField>
              <OrganizationAccessField label="Resource type">
                <PlatformSelector
                  value={draft.resourceType}
                  options={ORGANIZATION_ACCESS_RESOURCE_TYPE_OPTIONS}
                  onValueChange={(resourceType) =>
                    setDraft((current) => {
                      if (!current) return current;
                      const firstResource = resources.find(
                        (resource) => resource.type === resourceType,
                      );
                      return {
                        ...current,
                        resourceType,
                        resourceId: firstResource?.id || "",
                        allowedActions: [],
                      };
                    })
                  }
                  ariaLabel="Delegated resource type"
                  fullWidth
                />
              </OrganizationAccessField>
              <OrganizationAccessField label="Resource">
                {availableResources.length ? (
                  <PlatformSelector
                    value={draft.resourceId}
                    options={availableResources.map((resource) => ({
                      value: resource.id,
                      label: resource.name,
                      description: resource.id,
                    }))}
                    onValueChange={(resourceId) =>
                      setDraft((current) =>
                        current ? { ...current, resourceId } : current,
                      )
                    }
                    ariaLabel="Delegated resource"
                    fullWidth
                  />
                ) : (
                  <input
                    className="organization-access-control__input"
                    value={draft.resourceId}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? { ...current, resourceId: event.target.value }
                          : current,
                      )
                    }
                    placeholder="Resource ID"
                  />
                )}
              </OrganizationAccessField>
            </div>
            <div className="organization-access-control__subsection">
              <h3>Allowed actions</h3>
              <p>
                Delegations are intersected with the caller’s current access and
                the resource’s All Agents policy.
              </p>
              <div className="organization-access-control__action-grid">
                {availableActions.map((action) => {
                  const checked = draft.allowedActions.includes(action.id);
                  return (
                    <button
                      key={action.id}
                      type="button"
                      className={`organization-access-control__action-option${checked ? " is-selected" : ""}`}
                      onClick={() =>
                        setDraft((current) =>
                          current
                            ? {
                                ...current,
                                allowedActions: checked
                                  ? current.allowedActions.filter(
                                      (actionId) => actionId !== action.id,
                                    )
                                  : [...current.allowedActions, action.id],
                              }
                            : current,
                        )
                      }
                    >
                      <PlatformCheckbox
                        checked={checked}
                        aria-label={`${checked ? "Remove" : "Add"} ${action.label}`}
                        tabIndex={-1}
                      />
                      <span>
                        <strong>{action.label}</strong>
                        <small>{action.id}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </PlatformModal>

      <PlatformConfirmationModal
        open={Boolean(revoking)}
        title="Revoke this delegation?"
        description="The agent will immediately lose authority granted through this delegation and any child delegations."
        confirmLabel="Revoke Delegation"
        confirmingLabel="Revoking..."
        tone="destructive"
        onCancel={() => setRevoking(null)}
        onConfirm={async () => {
          if (!revoking) return;
          try {
            await repository.revokeDelegation(revoking.id);
            onDelegationsChange(
              delegations.map((delegation) =>
                delegation.id === revoking.id
                  ? {
                      ...delegation,
                      status: "revoked",
                      revokedAt: new Date().toISOString(),
                    }
                  : delegation,
              ),
            );
            setRevoking(null);
          } catch (error) {
            onError(
              error instanceof Error
                ? error.message
                : "Failed to revoke delegation.",
            );
            throw error;
          }
        }}
      />
    </>
  );
}

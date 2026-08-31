import { Check, X } from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { useMemo, useState } from "react";
import {
  PlatformDataTable,
  type PlatformDataTableAction,
  type PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformConfirmationModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  formatOrganizationAccessDate,
  formatOrganizationAccessLabel,
} from "./organization-access-constants.js";
import {
  OrganizationAccessIdentity,
  OrganizationAccessStatusLabel,
} from "./organization-access-presentation.js";
import type { OrganizationAccessRepository } from "./organization-access-repository.js";
import type {
  AuthorizationApprovalStatus,
  OrganizationAccessAgent,
  OrganizationAuthorizationApproval,
} from "./organization-access-types.js";

interface OrganizationApprovalsPanelProps {
  repository: OrganizationAccessRepository;
  approvals: readonly OrganizationAuthorizationApproval[];
  agents: readonly OrganizationAccessAgent[];
  loading: boolean;
  canManage: boolean;
  onApprovalsChange: (approvals: OrganizationAuthorizationApproval[]) => void;
  onError: (message: string) => void;
}

export function OrganizationApprovalsPanel({
  repository,
  approvals,
  agents,
  loading,
  canManage,
  onApprovalsChange,
  onError,
}: OrganizationApprovalsPanelProps) {
  const [statusFilter, setStatusFilter] = useState<
    AuthorizationApprovalStatus | "all"
  >("pending");
  const [resolution, setResolution] = useState<{
    approval: OrganizationAuthorizationApproval;
    status: "approved" | "denied";
  } | null>(null);

  const filteredApprovals = useMemo(
    () =>
      statusFilter === "all"
        ? approvals
        : approvals.filter((approval) => approval.status === statusFilter),
    [approvals, statusFilter],
  );

  const columns = useMemo<
    PlatformDataTableColumn<OrganizationAuthorizationApproval>[]
  >(
    () => [
      {
        id: "principal",
        header: "Requester",
        accessor: "principalId",
        sortable: true,
        width: "minmax(190px, 1fr)",
        cell: ({ row }) => {
          const agent = agents.find(
            (candidate) =>
              candidate.id === row.principalId ||
              candidate.id === row.principalId.replace(/^agent:/, ""),
          );
          return (
            <OrganizationAccessIdentity
              label={agent?.name || row.principalId}
              detail={formatOrganizationAccessLabel(row.principalKind)}
              imageUrl={agent?.profileImageUrl}
            />
          );
        },
      },
      {
        id: "action",
        header: "Action",
        accessor: "actionId",
        sortable: true,
        width: "minmax(170px, .9fr)",
        cell: ({ row }) => formatOrganizationAccessLabel(row.actionId),
      },
      {
        id: "resource",
        header: "Resource",
        accessor: (row) => `${row.resourceType}:${row.resourceId}`,
        sortable: true,
        width: "minmax(210px, 1.12fr)",
        cell: ({ row }) => (
          <span className="organization-access-control__stacked-value">
            <span>{row.resourceId}</span>
            <small>{formatOrganizationAccessLabel(row.resourceType)}</small>
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessor: "status",
        sortable: true,
        width: "minmax(105px, .52fr)",
        cell: ({ row }) => <OrganizationAccessStatusLabel status={row.status} />,
      },
      {
        id: "requested",
        header: "Requested",
        accessor: (row) => Date.parse(row.requestedAt || "") || 0,
        sortable: true,
        sortDescFirst: true,
        align: "end",
        width: "minmax(155px, .72fr)",
        cell: ({ row }) => formatOrganizationAccessDate(row.requestedAt),
      },
    ],
    [agents],
  );

  const getRowActions = (
    approval: OrganizationAuthorizationApproval,
  ): readonly PlatformDataTableAction<OrganizationAuthorizationApproval>[] =>
    approval.status === "pending"
      ? [
          {
            id: "approve",
            label: "Approve",
            icon: Check,
            disabled: !canManage,
            onSelect: () => setResolution({ approval, status: "approved" }),
          },
          {
            id: "deny",
            label: "Deny",
            icon: X,
            disabled: !canManage,
            onSelect: () => setResolution({ approval, status: "denied" }),
          },
        ]
      : [];

  return (
    <>
      <PlatformDataTable
        rows={filteredApprovals}
        columns={columns}
        getRowId={(row) => row.id}
        ariaLabel="Authorization approval requests"
        variant="minimalistic-ui"
        surface="default"
        pagination={false}
        loading={loading}
        sorting={{ defaultValue: { id: "requested", direction: "desc" } }}
        toolbar={{
          title: "Approval Requests",
          search: {
            placeholder: "Search approval requests",
            getSearchText: (row) =>
              `${row.principalId} ${row.actionId} ${row.resourceType} ${row.resourceId} ${row.status}`,
          },
          filters: [
            {
              id: "status",
              label: "Status",
              value: statusFilter,
              onChange: (value) =>
                setStatusFilter(
                  value as AuthorizationApprovalStatus | "all",
                ),
              options: [
                { id: "all", label: "All Requests" },
                { id: "pending", label: "Pending" },
                { id: "approved", label: "Approved" },
                { id: "denied", label: "Denied" },
                { id: "expired", label: "Expired" },
                { id: "cancelled", label: "Cancelled" },
              ],
            },
          ],
        }}
        getRowActions={getRowActions}
        emptyState="No authorization approval requests yet."
        noResultsState="No approval requests match this view."
      />
      <PlatformConfirmationModal
        open={Boolean(resolution)}
        title={
          resolution?.status === "approved"
            ? "Approve this request?"
            : "Deny this request?"
        }
        description={
          resolution
            ? `${formatOrganizationAccessLabel(resolution.approval.actionId)} on ${resolution.approval.resourceId}. The decision only applies to this exact principal, action, and resource request.`
            : ""
        }
        confirmLabel={
          resolution?.status === "approved" ? "Approve Request" : "Deny Request"
        }
        confirmingLabel="Resolving..."
        tone={resolution?.status === "denied" ? "destructive" : "default"}
        onCancel={() => setResolution(null)}
        onConfirm={async () => {
          if (!resolution) return;
          try {
            const updated = await repository.resolveApproval(
              resolution.approval.id,
              resolution.status,
            );
            onApprovalsChange(
              approvals.map((approval) =>
                approval.id === updated.id ? updated : approval,
              ),
            );
            setResolution(null);
          } catch (error) {
            onError(
              error instanceof Error
                ? error.message
                : "Failed to resolve approval.",
            );
            throw error;
          }
        }}
      />
    </>
  );
}

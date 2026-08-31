import { Eye } from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { useMemo, useState } from "react";
import {
  PlatformDataTable,
  type PlatformDataTableAction,
  type PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import { PlatformSecondaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import {
  formatOrganizationAccessDate,
  formatOrganizationAccessLabel,
} from "./organization-access-constants.js";
import {
  OrganizationAccessStatusLabel,
} from "./organization-access-presentation.js";
import type { OrganizationAuthorizationDecision } from "./organization-access-types.js";

interface OrganizationAuditPanelProps {
  decisions: readonly OrganizationAuthorizationDecision[];
  loading: boolean;
}

export function OrganizationAuditPanel({
  decisions,
  loading,
}: OrganizationAuditPanelProps) {
  const [effectFilter, setEffectFilter] = useState("all");
  const [selectedDecision, setSelectedDecision] =
    useState<OrganizationAuthorizationDecision | null>(null);
  const filteredDecisions = useMemo(
    () =>
      effectFilter === "all"
        ? decisions
        : decisions.filter((decision) =>
            effectFilter === "allowed" ? decision.allowed : !decision.allowed,
          ),
    [decisions, effectFilter],
  );
  const columns = useMemo<
    PlatformDataTableColumn<OrganizationAuthorizationDecision>[]
  >(
    () => [
      {
        id: "time",
        header: "Time",
        accessor: (row) => Date.parse(row.createdAt || "") || 0,
        sortable: true,
        sortDescFirst: true,
        width: "minmax(155px, .7fr)",
        cell: ({ row }) => formatOrganizationAccessDate(row.createdAt),
      },
      {
        id: "principal",
        header: "Principal",
        accessor: "principalId",
        sortable: true,
        width: "minmax(175px, .85fr)",
        cell: ({ row }) => (
          <span className="organization-access-control__stacked-value">
            <span>{row.principalId}</span>
            <small>{formatOrganizationAccessLabel(row.principalKind)}</small>
          </span>
        ),
      },
      {
        id: "action",
        header: "Action",
        accessor: "actionId",
        sortable: true,
        width: "minmax(165px, .78fr)",
        cell: ({ row }) => formatOrganizationAccessLabel(row.actionId),
      },
      {
        id: "resource",
        header: "Resource",
        accessor: (row) => `${row.resourceType}:${row.resourceId}`,
        sortable: true,
        width: "minmax(205px, 1fr)",
        cell: ({ row }) => (
          <span className="organization-access-control__stacked-value">
            <span>{row.resourceId}</span>
            <small>{formatOrganizationAccessLabel(row.resourceType)}</small>
          </span>
        ),
      },
      {
        id: "effect",
        header: "Decision",
        accessor: (row) => (row.allowed ? "allowed" : row.effect),
        sortable: true,
        width: "minmax(105px, .5fr)",
        cell: ({ row }) => (
          <OrganizationAccessStatusLabel
            status={row.allowed ? "allowed" : row.effect || "denied"}
          />
        ),
      },
      {
        id: "reason",
        header: "Reason",
        accessor: "reasonCode",
        sortable: true,
        width: "minmax(175px, .82fr)",
        cell: ({ row }) => formatOrganizationAccessLabel(row.reasonCode),
      },
    ],
    [],
  );
  const getRowActions = (
    decision: OrganizationAuthorizationDecision,
  ): readonly PlatformDataTableAction<OrganizationAuthorizationDecision>[] => [
    {
      id: "explain",
      label: "View explanation",
      icon: Eye,
      onSelect: () => setSelectedDecision(decision),
    },
  ];

  return (
    <>
      <PlatformDataTable
        rows={filteredDecisions}
        columns={columns}
        getRowId={(row) => row.id}
        ariaLabel="Authorization decision audit"
        variant="minimalistic-ui"
        surface="default"
        pagination={{
          defaultValue: { pageIndex: 0, pageSize: 20 },
          pageSizeOptions: [20, 50, 100],
        }}
        loading={loading}
        sorting={{ defaultValue: { id: "time", direction: "desc" } }}
        toolbar={{
          title: "Decision Audit",
          search: {
            placeholder: "Search authorization decisions",
            getSearchText: (row) =>
              `${row.principalId} ${row.actionId} ${row.resourceType} ${row.resourceId} ${row.reasonCode}`,
          },
          filters: [
            {
              id: "effect",
              label: "Decision",
              value: effectFilter,
              onChange: setEffectFilter,
              options: [
                { id: "all", label: "All Decisions" },
                { id: "allowed", label: "Allowed" },
                { id: "denied", label: "Denied" },
              ],
            },
          ],
        }}
        onRowActivate={setSelectedDecision}
        getRowAriaLabel={(row) =>
          `${formatOrganizationAccessLabel(row.actionId)} ${row.allowed ? "allowed" : "denied"}`
        }
        getRowActions={getRowActions}
        emptyState="No authorization decisions have been recorded."
        noResultsState="No decisions match this view."
      />
      <PlatformModal
        open={Boolean(selectedDecision)}
        title="Authorization explanation"
        description={
          selectedDecision
            ? `${formatOrganizationAccessLabel(selectedDecision.actionId)} on ${selectedDecision.resourceId}`
            : ""
        }
        size="medium"
        scrollable
        onClose={() => setSelectedDecision(null)}
        footer={
          <PlatformSecondaryButton
            size="medium"
            onClick={() => setSelectedDecision(null)}
          >
            Close
          </PlatformSecondaryButton>
        }
      >
        {selectedDecision ? (
          <div className="organization-access-control__explanation">
            <div className="organization-access-control__decision-summary">
              <OrganizationAccessStatusLabel
                status={
                  selectedDecision.allowed
                    ? "allowed"
                    : selectedDecision.effect || "denied"
                }
              />
              <span>
                {formatOrganizationAccessLabel(selectedDecision.reasonCode)}
              </span>
              <time>
                {formatOrganizationAccessDate(selectedDecision.createdAt)}
              </time>
            </div>
            <dl className="organization-access-control__metadata">
              <div>
                <dt>Decision ID</dt>
                <dd>{selectedDecision.id}</dd>
              </div>
              <div>
                <dt>Principal</dt>
                <dd>{selectedDecision.principalId}</dd>
              </div>
              <div>
                <dt>Policy version</dt>
                <dd>{selectedDecision.policyVersionId || "—"}</dd>
              </div>
              <div>
                <dt>Delegation</dt>
                <dd>{selectedDecision.delegationId || "—"}</dd>
              </div>
            </dl>
            <div className="organization-access-control__steps">
              {selectedDecision.steps.map((step, index) => (
                <div
                  key={`${step.source}:${step.reasonCode}:${index}`}
                  className="organization-access-control__step"
                >
                  <span>{index + 1}</span>
                  <div>
                    <strong>{formatOrganizationAccessLabel(step.source)}</strong>
                    <p>
                      {step.detail ||
                        formatOrganizationAccessLabel(step.reasonCode)}
                    </p>
                  </div>
                  <OrganizationAccessStatusLabel status={step.effect} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </PlatformModal>
    </>
  );
}

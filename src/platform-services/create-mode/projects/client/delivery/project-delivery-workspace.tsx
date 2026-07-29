import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CircleGauge,
  FileCheck2,
  FlaskConical,
  GitPullRequestArrow,
  ShieldCheck,
} from "lucide-react";
import {
  PlatformDataTable,
  type PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformLoadingState } from "../../../../../platform-ui/components/composite/loading-state/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformLabel } from "../../../../../platform-ui/components/ui/label/index.js";

type DeliveryDesignStatus = "needs_input" | "ready" | "archived";
type CampaignStatus =
  | "draft"
  | "queued"
  | "producing"
  | "evaluating"
  | "awaiting_assurance"
  | "ready_to_promote"
  | "completed"
  | "plateaued"
  | "failed"
  | "cancelled";

interface DeliveryDesignIssue {
  code: string;
  path: string;
  message: string;
}

interface DeliveryDesignResult {
  readiness: "ready" | "needs_input";
  archetype: string;
  designFingerprint: string;
  missingInputs: DeliveryDesignIssue[];
  assumptions: string[];
}

interface DeliveryDesign {
  id: string;
  revision: number;
  status: DeliveryDesignStatus;
  designFingerprint: string;
  request: Record<string, unknown>;
  design: DeliveryDesignResult;
}

interface CampaignAttempt {
  id: string;
  attemptNumber: number;
  status: string;
  score: number | null;
  passRate: number | null;
  improvement: number | null;
  testRunId: string | null;
  evaluationRunId: string | null;
  assuranceRunId: string | null;
  acceptanceFingerprint: string | null;
  error: string | null;
}

interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  attemptCount: number;
  baselineScore: number;
  bestScore: number | null;
  costUsd: number;
  attempts?: CampaignAttempt[];
}

interface RequestFailure extends Error {
  status?: number;
}

export interface ProjectDeliveryWorkspaceProps {
  projectId: string;
  projectName?: string;
  projectDescription?: string;
  initialRequest?: Record<string, unknown> | null;
  canManage?: boolean;
  fetchImpl?: typeof fetch;
}

function statusLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusVariant(
  value: DeliveryDesignStatus | CampaignStatus | string,
): "gray" | "green" | "blue" | "yellow" | "red" {
  if (["ready", "completed", "promoted", "accepted"].includes(value)) return "green";
  if (["queued", "producing", "evaluating"].includes(value)) return "blue";
  if (["awaiting_assurance", "ready_to_promote", "plateaued", "needs_input"].includes(value)) {
    return "yellow";
  }
  if (["failed", "rejected", "cancelled"].includes(value)) return "red";
  return "gray";
}

function formatMetric(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? `${Math.round(value * 1000) / 10}%`
    : "—";
}

async function readJson(
  fetchImpl: typeof fetch,
  path: string,
  init?: RequestInit,
): Promise<Record<string, unknown>> {
  const response = await fetchImpl(path, {
    credentials: "same-origin",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const failure = new Error(
      String(payload.message || payload.error || `Request failed (${response.status}).`),
    ) as RequestFailure;
    failure.status = response.status;
    throw failure;
  }
  return payload;
}

function EvidenceReference({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <span className="project-delivery-workspace__evidence-reference">
      <span>{label}</span>
      <code title={value}>{value}</code>
    </span>
  );
}

export function ProjectDeliveryWorkspace({
  projectId,
  projectName = "",
  projectDescription = "",
  initialRequest = null,
  canManage = false,
  fetchImpl = fetch,
}: ProjectDeliveryWorkspaceProps) {
  const [goal, setGoal] = useState(projectDescription.trim());
  const [context, setContext] = useState("");
  const [deliveryDesign, setDeliveryDesign] = useState<DeliveryDesign | null>(null);
  const [preview, setPreview] = useState<DeliveryDesignResult | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState("");
  const [error, setError] = useState("");
  const [appliedPlanId, setAppliedPlanId] = useState("");
  const [expandedCampaignId, setExpandedCampaignId] = useState("");

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError("");
    const encodedProjectId = encodeURIComponent(projectId);
    const [designResult, campaignResult] = await Promise.allSettled([
      readJson(
        fetchImpl,
        `/api/real/projects/${encodedProjectId}/delivery-design`,
      ),
      readJson(
        fetchImpl,
        `/api/real/optimization-campaigns?projectId=${encodedProjectId}&limit=100`,
      ),
    ]);
    if (designResult.status === "fulfilled") {
      const persisted =
        (designResult.value.deliveryDesign || null) as DeliveryDesign | null;
      setDeliveryDesign(persisted);
      const persistedBrief = persisted?.request?.brief;
      if (
        persistedBrief
        && typeof persistedBrief === "object"
        && !Array.isArray(persistedBrief)
      ) {
        const brief = persistedBrief as Record<string, unknown>;
        setGoal(String(brief.goal || projectDescription).trim());
        setContext(String(brief.context || "").trim());
      }
    } else if ((designResult.reason as RequestFailure)?.status !== 404) {
      setError((designResult.reason as Error).message);
    }
    if (campaignResult.status === "fulfilled") {
      const rows = campaignResult.value.data || campaignResult.value.campaigns;
      setCampaigns(Array.isArray(rows) ? rows as Campaign[] : []);
    } else {
      setError((current) => current || (campaignResult.reason as Error).message);
    }
    setLoading(false);
  }, [fetchImpl, projectDescription, projectId]);

  useEffect(() => {
    setGoal(projectDescription.trim());
    setContext("");
    setPreview(null);
    setDeliveryDesign(null);
    setCampaigns([]);
    setAppliedPlanId("");
    setExpandedCampaignId("");
    void load();
  }, [load, projectDescription, projectId]);

  const buildRequest = useCallback(() => {
    const persistedRequest = deliveryDesign?.request;
    const base = (
      persistedRequest
      && typeof persistedRequest === "object"
      && !Array.isArray(persistedRequest)
        ? persistedRequest
        : initialRequest || {}
    ) as Record<string, unknown>;
    const baseBrief = (
      base.brief
      && typeof base.brief === "object"
      && !Array.isArray(base.brief)
        ? base.brief
        : {}
    ) as Record<string, unknown>;
    return {
      schemaVersion: "computer_agents_project_delivery_design_request_v1",
      ...base,
      brief: {
        workflowKind: "auto",
        constraints: [],
        expectedOutputs: [],
        schedule: null,
        ...baseBrief,
        ...(projectName.trim() ? { name: projectName.trim() } : {}),
        goal: goal.trim(),
        context: context.trim(),
      },
      validationAssets: Array.isArray(base.validationAssets)
        ? base.validationAssets
        : [],
      capabilities: base.capabilities || {
        requiredSecretKeys: [],
      },
      controls: base.controls || {
        mode: "autonomous",
        optimizationEnabled: true,
        maximumOptimizationIterations: 5,
        guardrailPolicies: [],
        assuranceApprovalMode: "manual",
        repairEnabled: true,
        maximumRepairAttempts: 2,
      },
      acceptance: base.acceptance || {
        minimumAverageScore: 0.8,
        minimumPassRate: 0.8,
        requireAllTestsPassing: true,
        requirePublishedOptimizationCandidate: false,
      },
      budget: base.budget || {
        maximumTotalCostUsd: 50,
      },
    };
  }, [
    context,
    deliveryDesign?.request,
    goal,
    initialRequest,
    projectName,
  ]);

  const previewDesign = useCallback(async () => {
    if (!goal.trim()) return;
    setPendingAction("preview");
    setError("");
    try {
      const payload = await readJson(
        fetchImpl,
        `/api/real/projects/${encodeURIComponent(projectId)}/delivery-design/preview`,
        {
          method: "POST",
          body: JSON.stringify({ request: buildRequest() }),
        },
      );
      setPreview(payload.deliveryDesign as unknown as DeliveryDesignResult);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setPendingAction("");
    }
  }, [buildRequest, fetchImpl, goal, projectId]);

  const saveDesign = useCallback(async () => {
    if (!canManage || !goal.trim()) return;
    setPendingAction("save");
    setError("");
    try {
      const payload = await readJson(
        fetchImpl,
        `/api/real/projects/${encodeURIComponent(projectId)}/delivery-design`,
        {
          method: "PUT",
          body: JSON.stringify({
            request: buildRequest(),
            idempotencyKey: `project-delivery-design:${projectId}:${Date.now()}`,
          }),
        },
      );
      const savedDesign = payload.deliveryDesign as unknown as DeliveryDesign;
      setDeliveryDesign(savedDesign);
      setPreview(savedDesign.design);
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setPendingAction("");
    }
  }, [buildRequest, canManage, fetchImpl, goal, projectId]);

  const applyDesign = useCallback(async () => {
    if (!canManage || deliveryDesign?.status !== "ready") return;
    setPendingAction("apply");
    setError("");
    try {
      const payload = await readJson(
        fetchImpl,
        `/api/real/projects/${encodeURIComponent(projectId)}/delivery-design/apply`,
        {
          method: "POST",
          body: JSON.stringify({
            designFingerprint: deliveryDesign.designFingerprint,
            idempotencyKey: `project-delivery-apply:${projectId}:${deliveryDesign.revision}`,
          }),
        },
      );
      const plan = payload.deliveryPlan as Record<string, unknown> | undefined;
      setAppliedPlanId(String(plan?.id || ""));
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setPendingAction("");
    }
  }, [canManage, deliveryDesign, fetchImpl, projectId]);

  const loadCampaignDetails = useCallback(async (
    campaign: Campaign,
  ): Promise<Campaign> => {
    const payload = await readJson(
      fetchImpl,
      `/api/real/optimization-campaigns/${encodeURIComponent(campaign.id)}`,
    );
    const detailed = payload.campaign as unknown as Campaign;
    setCampaigns((current) => current.map((row) =>
      row.id === detailed.id ? detailed : row
    ));
    return detailed;
  }, [fetchImpl]);

  const runCampaignAction = useCallback(async (
    campaign: Campaign,
    action: "start" | "cancel" | "promote",
  ) => {
    if (!canManage) return;
    setPendingAction(`${action}:${campaign.id}`);
    setError("");
    try {
      const detailedCampaign = action === "promote" && !campaign.attempts?.length
        ? await loadCampaignDetails(campaign)
        : campaign;
      const attempt = [...(detailedCampaign.attempts || [])]
        .reverse()
        .find((candidate) => candidate.acceptanceFingerprint);
      if (action === "promote" && !attempt?.acceptanceFingerprint) {
        throw new Error(
          "The campaign has no accepted attempt fingerprint to promote.",
        );
      }
      const suffix = action === "promote"
        ? `/attempts/${encodeURIComponent(attempt!.id)}/promote`
        : `/${action}`;
      const body = action === "cancel"
        ? { reason: "Cancelled from the Project delivery workspace." }
        : action === "promote"
          ? { acceptanceFingerprint: attempt!.acceptanceFingerprint }
          : {};
      await readJson(
        fetchImpl,
        `/api/real/optimization-campaigns/${encodeURIComponent(campaign.id)}${suffix}`,
        { method: "POST", body: JSON.stringify(body) },
      );
      await load();
    } catch (requestError) {
      setError((requestError as Error).message);
    } finally {
      setPendingAction("");
    }
  }, [canManage, fetchImpl, load, loadCampaignDetails]);

  const columns = useMemo<Array<PlatformDataTableColumn<Campaign>>>(() => [
    {
      id: "name",
      header: "Campaign",
      accessor: "name",
      sortable: true,
      cell: ({ row }) => (
        <span className="project-delivery-workspace__campaign-name">
          <span>{row.name}</span>
          <code>{row.id}</code>
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessor: "status",
      sortable: true,
      cell: ({ row }) => (
        <PlatformLabel variant={statusVariant(row.status)}>
          {statusLabel(row.status)}
        </PlatformLabel>
      ),
    },
    {
      id: "attempts",
      header: "Attempts",
      accessor: "attemptCount",
      sortable: true,
      width: "110px",
    },
    {
      id: "quality",
      header: "Best / baseline",
      accessor: (row) => row.bestScore ?? row.baselineScore,
      sortable: true,
      cell: ({ row }) => `${formatMetric(row.bestScore)} / ${formatMetric(row.baselineScore)}`,
    },
    {
      id: "cost",
      header: "Cost",
      accessor: "costUsd",
      sortable: true,
      cell: ({ row }) => `$${row.costUsd.toFixed(2)}`,
      width: "100px",
    },
    {
      id: "action",
      header: "",
      width: "130px",
      cell: ({ row }) => {
        const action = row.status === "draft"
          ? "start"
          : row.status === "ready_to_promote"
            ? "promote"
            : ["queued", "producing", "evaluating", "awaiting_assurance"].includes(row.status)
              ? "cancel"
              : null;
        if (!action) return null;
        return (
          <PlatformSecondaryButton
            size="compact"
            disabled={!canManage || Boolean(pendingAction)}
            onClick={(event) => {
              event.stopPropagation();
              void runCampaignAction(row, action);
            }}
          >
            {action === "start" ? "Start" : action === "promote" ? "Promote" : "Cancel"}
          </PlatformSecondaryButton>
        );
      },
    },
  ], [canManage, pendingAction, runCampaignAction]);

  const activeResult = preview || deliveryDesign?.design || null;
  const deliveryReady = deliveryDesign?.status === "ready";
  const campaignEmptyState: ReactNode = (
    <PlatformEmptyState
      icon={FlaskConical}
      title="No Optimization Campaigns"
      description="Campaigns are independently callable and appear here when correlated with this Project."
    />
  );

  if (loading) {
    return (
      <PlatformLoadingState
        centered
        message="Loading delivery controls"
        className="project-delivery-workspace__loading"
      />
    );
  }

  return (
    <section
      className="project-delivery-workspace"
      aria-label="Project delivery"
      data-project-delivery-workspace="true"
    >
      <div className="project-delivery-workspace__cards">
        <PlatformUiCard variant="feature">
          <div className="platform-ui-card__feature-icon is-blue">
            <GitPullRequestArrow width={34} height={34} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h2 className="platform-ui-card__feature-title">Delivery Designer</h2>
          <p className="platform-ui-card__feature-description">
            Turn the Project brief into a strict, inspectable topology and evidence plan.
            Previewing and saving have no execution side effects.
          </p>
          <label className="project-delivery-workspace__field">
            <span>Goal</span>
            <textarea
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              rows={3}
              placeholder="Describe the outcome this Project must deliver."
            />
          </label>
          <label className="project-delivery-workspace__field">
            <span>Context and constraints</span>
            <textarea
              value={context}
              onChange={(event) => setContext(event.target.value)}
              rows={3}
              placeholder="Add source constraints, required services, and acceptance context."
            />
          </label>
          <div className="project-delivery-workspace__actions">
            <PlatformSecondaryButton
              onClick={() => void previewDesign()}
              disabled={!goal.trim() || Boolean(pendingAction)}
            >
              Preview
            </PlatformSecondaryButton>
            <PlatformSecondaryButton
              onClick={() => void saveDesign()}
              disabled={!canManage || !goal.trim() || Boolean(pendingAction)}
            >
              Save design
            </PlatformSecondaryButton>
            <PlatformPrimaryButton
              onClick={() => void applyDesign()}
              disabled={!canManage || !deliveryReady || Boolean(pendingAction)}
            >
              Apply to plan
            </PlatformPrimaryButton>
          </div>
        </PlatformUiCard>

        <PlatformUiCard variant="feature">
          <div className="platform-ui-card__feature-icon is-violet">
            <ShieldCheck width={34} height={34} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div className="project-delivery-workspace__status-title">
            <h2 className="platform-ui-card__feature-title">Readiness</h2>
            <PlatformLabel
              variant={statusVariant(deliveryDesign?.status || activeResult?.readiness || "draft")}
            >
              {statusLabel(deliveryDesign?.status || activeResult?.readiness || "Not designed")}
            </PlatformLabel>
          </div>
          <p className="platform-ui-card__feature-description">
            Applying creates a delivery-plan revision only. Provisioning, execution,
            candidate promotion, and deployment remain separately authorized actions.
          </p>
          <dl className="project-delivery-workspace__metrics">
            <div>
              <dt>Revision</dt>
              <dd>{deliveryDesign?.revision ?? "—"}</dd>
            </div>
            <div>
              <dt>Archetype</dt>
              <dd>{activeResult?.archetype ? statusLabel(activeResult.archetype) : "—"}</dd>
            </div>
            <div>
              <dt>Blocking inputs</dt>
              <dd>{activeResult?.missingInputs?.length ?? "—"}</dd>
            </div>
            <div>
              <dt>Campaigns</dt>
              <dd>{campaigns.length}</dd>
            </div>
          </dl>
          {activeResult?.missingInputs?.length ? (
            <ul className="project-delivery-workspace__issues">
              {activeResult.missingInputs.map((issue) => (
                <li key={`${issue.code}:${issue.path}`}>
                  <strong>{issue.path || "Brief"}</strong>
                  <span>{issue.message}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {appliedPlanId ? (
            <div className="project-delivery-workspace__applied">
              <FileCheck2 width={15} height={15} strokeWidth={1.8} aria-hidden="true" />
              <span>Applied as plan</span>
              <code>{appliedPlanId}</code>
            </div>
          ) : null}
        </PlatformUiCard>
      </div>

      {error ? (
        <div className="project-delivery-workspace__error" role="alert">
          {error}
        </div>
      ) : null}

      <section className="project-delivery-workspace__campaigns" aria-label="Optimization Campaigns">
        <div className="project-delivery-workspace__section-heading">
          <span>
            <CircleGauge width={18} height={18} strokeWidth={1.7} aria-hidden="true" />
            <h2>Optimization Campaigns</h2>
          </span>
          <p>Bounded candidate improvement with exact Test, Evaluation, and Assurance evidence.</p>
        </div>
        <PlatformDataTable<Campaign>
          rows={campaigns}
          columns={columns}
          getRowId={(campaign) => campaign.id}
          ariaLabel="Project Optimization Campaigns"
          surface="plain"
          variant="minimalistic-ui"
          pagination={false}
          emptyState={campaignEmptyState}
          onRowActivate={(campaign) => {
            setExpandedCampaignId((current) => current === campaign.id ? "" : campaign.id);
            if (!campaign.attempts) {
              void loadCampaignDetails(campaign).catch((requestError) => {
                setError((requestError as Error).message);
              });
            }
          }}
          isRowExpanded={(campaign) => campaign.id === expandedCampaignId}
          renderExpandedRow={({ row }) => (
            <div className="project-delivery-workspace__attempts">
              {(row.attempts || []).length ? row.attempts!.map((attempt) => (
                <div key={attempt.id} className="project-delivery-workspace__attempt">
                  <span className="project-delivery-workspace__attempt-heading">
                    <strong>Attempt {attempt.attemptNumber}</strong>
                    <PlatformLabel variant={statusVariant(attempt.status)}>
                      {statusLabel(attempt.status)}
                    </PlatformLabel>
                    <span>{formatMetric(attempt.score)}</span>
                  </span>
                  <span className="project-delivery-workspace__evidence">
                    <EvidenceReference label="Test" value={attempt.testRunId} />
                    <EvidenceReference label="Evaluation" value={attempt.evaluationRunId} />
                    <EvidenceReference label="Assurance" value={attempt.assuranceRunId} />
                  </span>
                  {attempt.error ? <span className="project-delivery-workspace__attempt-error">{attempt.error}</span> : null}
                </div>
              )) : (
                <span className="project-delivery-workspace__attempt-empty">
                  This campaign has not created an attempt yet.
                </span>
              )}
            </div>
          )}
        />
      </section>
    </section>
  );
}

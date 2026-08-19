import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  ClipboardCheck,
  MessageSquare,
  Pause,
  Play,
  Plus,
  Sparkles,
  Ticket,
  Trash2,
  Truck,
  Workflow,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  type SkillOverviewRow,
  SkillsOverviewPage,
} from "../../../../../platform-resources/skills/overview/skills-overview-page.js";
import type { PlatformDataTableAction } from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformPageHero } from "../../../../../platform-ui/components/composite/page-hero/index.js";
import { PlatformButtonSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import { PlatformSwitch } from "../../../../../platform-ui/components/ui/switch/index.js";
import { getBatchCreatorIdentity } from "../batch-identities.js";
import type { BatchCreatorIdentity, BatchJob, BatchTargetKind } from "../batches-types.js";

export type BatchesOverviewScope = "all" | "created";

export interface BatchesOverviewPageProps {
  jobs: readonly BatchJob[];
  loading?: boolean;
  mutating?: boolean;
  onOpen: (job: BatchJob) => void;
  onCreate: (targetKind?: BatchTargetKind) => void;
  onStart: (job: BatchJob) => void;
  onHold: (job: BatchJob) => void;
  onCancel: (job: BatchJob) => void;
  onDelete: (jobs: readonly BatchJob[]) => void;
  onReorder: (job: BatchJob, index: number) => void;
  controlsPortalId?: string;
  scopePortalId?: string;
  scope?: BatchesOverviewScope;
  onScopeChange?: (scope: BatchesOverviewScope) => void;
  currentUser?: BatchCreatorIdentity;
}

interface BatchOverviewRow extends SkillOverviewRow {
  job: BatchJob;
}

const STATUS_LABELS: Record<BatchJob["status"], string> = {
  held: "On shelf",
  queued: "Queued",
  dispatching: "Starting",
  running: "Running",
  succeeded: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

const REORDERABLE_STATUSES = new Set<BatchJob["status"]>(["held", "queued"]);

const CREATE_JOB_OPTIONS = [
  { targetKind: "thread_run", label: "Thread", icon: MessageSquare },
  { targetKind: "metronome_run", label: "Workflow", icon: Workflow },
  { targetKind: "evaluation_run", label: "Evaluation", icon: ClipboardCheck },
  { targetKind: "agent_optimization", label: "Agent Optimization", icon: Sparkles },
  { targetKind: "project_ticket_action", label: "Project Ticket", icon: Ticket },
] satisfies ReadonlyArray<{
  targetKind: BatchTargetKind;
  label: string;
  icon: typeof MessageSquare;
}>;

const JOB_TYPE_ICONS = {
  thread_run: MessageSquare,
  metronome_run: Workflow,
  evaluation_run: ClipboardCheck,
  agent_optimization: Sparkles,
  project_ticket_action: Ticket,
} satisfies Record<BatchTargetKind, typeof MessageSquare>;

function isQueueReorderable(job: BatchJob) {
  return REORDERABLE_STATUSES.has(job.status);
}

function isSameQueuePartition(job: BatchJob, candidate: BatchJob) {
  return (
    candidate.userId === job.userId &&
    candidate.organizationId === job.organizationId &&
    candidate.startPolicy === job.startPolicy &&
    candidate.queueLane === job.queueLane &&
    candidate.priority === job.priority
  );
}

function getQueueSiblings(jobs: readonly BatchJob[], job: BatchJob) {
  return jobs
    .filter((candidate) => isQueueReorderable(candidate) && isSameQueuePartition(job, candidate))
    .sort(
      (left, right) =>
        left.position - right.position ||
        Date.parse(left.createdAt) - Date.parse(right.createdAt) ||
        left.id.localeCompare(right.id),
    );
}

function compareBatchRows(left: BatchJob, right: BatchJob) {
  const policyRank: Record<BatchJob["startPolicy"], number> = {
    manual: 0,
    stay_on_shelf: 1,
    when_capacity_available: 2,
  };
  const leftPolicy = policyRank[left.startPolicy];
  const rightPolicy = policyRank[right.startPolicy];
  if (leftPolicy !== rightPolicy) return leftPolicy - rightPolicy;
  const leftQueued = isQueueReorderable(left) ? 0 : 1;
  const rightQueued = isQueueReorderable(right) ? 0 : 1;
  if (leftQueued !== rightQueued) return leftQueued - rightQueued;
  if (leftQueued === 1 && rightQueued === 1) {
    return (
      Date.parse(right.updatedAt) - Date.parse(left.updatedAt) || right.id.localeCompare(left.id)
    );
  }
  return (
    left.priority - right.priority ||
    left.position - right.position ||
    Date.parse(left.createdAt) - Date.parse(right.createdAt) ||
    left.id.localeCompare(right.id)
  );
}

export function getBatchDropIndex(
  jobs: readonly BatchJob[],
  job: BatchJob,
  target: BatchJob,
  placement: "before" | "after",
) {
  if (!isSameQueuePartition(job, target)) return -1;
  const siblings = getQueueSiblings(jobs, job);
  const withoutSource = siblings.filter((candidate) => candidate.id !== job.id);
  const targetIndex = withoutSource.findIndex((candidate) => candidate.id === target.id);
  if (targetIndex < 0) return -1;
  return targetIndex + (placement === "after" ? 1 : 0);
}

function label(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function relativeTime(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Recently";
  const elapsed = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function isCreatedByCurrentUser(job: BatchJob, currentUserId: string) {
  const normalizedCurrentUserId = String(currentUserId || "").trim();
  if (!normalizedCurrentUserId) return false;
  return String(job.createdByUserId || job.userId || "").trim() === normalizedCurrentUserId;
}

export function BatchesOverviewPage({
  jobs,
  loading = false,
  mutating = false,
  onOpen,
  onCreate,
  onStart,
  onHold,
  onCancel,
  onDelete,
  onReorder,
  controlsPortalId,
  scopePortalId = "",
  scope = "all",
  onScopeChange = () => undefined,
  currentUser = { id: "", name: "" },
}: BatchesOverviewPageProps) {
  const [scopePortalTarget, setScopePortalTarget] = useState<HTMLElement | null>(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  useEffect(() => {
    if (!scopePortalId || typeof document === "undefined") {
      setScopePortalTarget(null);
      return;
    }
    setScopePortalTarget(document.getElementById(scopePortalId));
  }, [scopePortalId]);
  const queuedJobs = useMemo(() => jobs.filter((job) => job.status !== "succeeded"), [jobs]);
  const visibleJobs = useMemo(
    () =>
      scope === "created"
        ? queuedJobs.filter((job) => isCreatedByCurrentUser(job, currentUser.id))
        : queuedJobs,
    [currentUser.id, queuedJobs, scope],
  );
  const orderedJobs = useMemo(() => [...visibleJobs].sort(compareBatchRows), [visibleJobs]);
  const rows = useMemo<BatchOverviewRow[]>(
    () =>
      orderedJobs.map((job) => {
        const creator = getBatchCreatorIdentity(job, currentUser);
        const JobIcon = JOB_TYPE_ICONS[job.targetKind];
        return {
          id: job.id,
          name: job.name,
          description: job.description || `${label(job.targetKind)} · ${STATUS_LABELS[job.status]}`,
          searchText: [
            job.name,
            job.description,
            job.targetKind,
            job.status,
            job.targetResourceId,
            job.sourceProjectId,
            job.sourceTicketId,
            creator.name,
          ]
            .filter(Boolean)
            .join(" "),
          icon: <JobIcon width={16} height={16} strokeWidth={1.8} />,
          isActive: !["succeeded", "failed", "cancelled"].includes(job.status),
          isCustom: true,
          creatorName: creator.name,
          creatorAvatarUrl: creator.avatarUrl,
          updatedAt: Date.parse(job.updatedAt) || 0,
          updatedLabel: `${STATUS_LABELS[job.status]} · ${relativeTime(job.updatedAt)}`,
          updatedTitle: new Date(job.updatedAt).toLocaleString(),
          job,
        };
      }),
    [currentUser, orderedJobs],
  );
  const rowActions = (
    row: SkillOverviewRow,
    state: { targetRows: readonly SkillOverviewRow[] },
  ): readonly PlatformDataTableAction<SkillOverviewRow>[] => {
    const batchRow = row as BatchOverviewRow;
    const job = batchRow.job;
    const targetJobs = (state.targetRows.length ? state.targetRows : [row]).map(
      (target) => (target as BatchOverviewRow).job,
    );
    if (targetJobs.length > 1) {
      const allDeletable = targetJobs.every(
        (target) =>
          target.status === "held" || ["succeeded", "failed", "cancelled"].includes(target.status),
      );
      return [
        {
          id: "delete",
          label: "Delete selected",
          icon: Trash2,
          disabled: mutating || !allDeletable,
          danger: true,
          onSelect: () => onDelete(targetJobs),
        },
      ];
    }
    const reorderable = isQueueReorderable(job);
    const queueSiblings = getQueueSiblings(jobs, job);
    const index = queueSiblings.findIndex((candidate) => candidate.id === job.id);
    const terminal = ["succeeded", "failed", "cancelled"].includes(job.status);
    return [
      {
        id: "open",
        label: "Open",
        icon: ChevronRight,
        onSelect: () => onOpen(job),
      },
      {
        id: "start",
        label: job.status === "failed" ? "Retry" : "Start",
        icon: Play,
        hidden: job.status !== "held" && job.status !== "failed",
        disabled: mutating,
        onSelect: () => onStart(job),
      },
      {
        id: "hold",
        label: "Return to shelf",
        icon: Pause,
        hidden: job.status !== "queued",
        disabled: mutating,
        onSelect: () => onHold(job),
      },
      {
        id: "cancel",
        label: "Cancel",
        icon: X,
        hidden: !["queued", "dispatching", "running"].includes(job.status),
        disabled: mutating,
        onSelect: () => onCancel(job),
      },
      {
        id: "move-up",
        label: "Move up",
        icon: ArrowUp,
        hidden: !reorderable,
        disabled: mutating || index <= 0,
        separatorBefore: true,
        onSelect: () => onReorder(job, index - 1),
      },
      {
        id: "move-down",
        label: "Move down",
        icon: ArrowDown,
        hidden: !reorderable,
        disabled: mutating || index < 0 || index >= queueSiblings.length - 1,
        onSelect: () => onReorder(job, index + 1),
      },
      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        hidden: !terminal && job.status !== "held",
        disabled: mutating,
        separatorBefore: true,
        onSelect: () => onDelete([job]),
      },
    ];
  };

  const scopeSwitch = (
    <PlatformSwitch
      className="playground-batches-overview-scope-switch"
      value={scope}
      options={[
        { value: "all", label: "All Jobs" },
        { value: "created", label: "Created by me" },
      ]}
      onValueChange={(value) => onScopeChange(value === "created" ? "created" : "all")}
      ariaLabel="Batch scope"
    />
  );

  return (
    <>
      {scopePortalTarget ? createPortal(scopeSwitch, scopePortalTarget) : null}
      <SkillsOverviewPage
        rows={rows}
        mode="custom"
        onModeChange={() => undefined}
        period="week"
        onPeriodChange={() => undefined}
        loading={loading}
        mutating={mutating}
        resourceName="Batches"
        searchPlaceholder="Search batches"
        grouping="flat"
        rowGrouping={{
          groups: [
            {
              id: "manual",
              label: "Keep on shelf",
              ariaLabel: "Keep on shelf",
            },
            {
              id: "stay_on_shelf",
              label: "Stay on shelf",
              ariaLabel: "Stay on shelf",
            },
            {
              id: "when_capacity_available",
              label: "Start when capacity is free",
              ariaLabel: "Start when capacity is free",
            },
          ],
          getGroupId: (row) => (row as BatchOverviewRow).job.startPolicy,
        }}
        rowReordering={{
          isRowReorderable: (row) => !mutating && isQueueReorderable((row as BatchOverviewRow).job),
          canDrop: (row, targetRow) => {
            const job = (row as BatchOverviewRow).job;
            const target = (targetRow as BatchOverviewRow).job;
            return isSameQueuePartition(job, target);
          },
          ariaLabel: (row) => `Reorder ${(row as BatchOverviewRow).job.name}`,
          onReorder: ({ row, targetRow, placement }) => {
            const job = (row as BatchOverviewRow).job;
            const target = (targetRow as BatchOverviewRow).job;
            const index = getBatchDropIndex(jobs, job, target, placement);
            if (index >= 0) onReorder(job, index);
          },
        }}
        sorting={{ value: null, onChange: () => undefined }}
        sortableColumns={false}
        controlsPortalId={controlsPortalId}
        pageClassName="is-skills is-batches"
        heroContent={
          <section className="skills-overview-guide" aria-label="Batches overview">
            <PlatformPageHero
              className="skills-overview-guide__hero"
              title="Queue work for the right moment"
            />
          </section>
        }
        headerActions={
          <PlatformButtonSelector
            mode="split-action"
            buttonVariant="primary"
            buttonSize="small"
            open={createMenuOpen}
            onOpenChange={setCreateMenuOpen}
            onAction={() => onCreate()}
            label="New Job"
            leading={<Plus width={14} height={14} strokeWidth={1.8} />}
            actionAriaLabel="New Job"
            popupAriaLabel="Choose job type"
            popupAlignment="right"
            popupRole="menu"
            popupVariant="minimal"
            popupWidth={224}
            closeOnSelect
          >
            {CREATE_JOB_OPTIONS.map((option) => {
              const JobIcon = option.icon;
              return (
                <button
                  key={option.targetKind}
                  type="button"
                  className="tb-popup-row"
                  role="menuitem"
                  onClick={() => onCreate(option.targetKind)}
                >
                  <JobIcon className="tb-popup-icon" aria-hidden="true" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </PlatformButtonSelector>
        }
        emptyState={
          <PlatformEmptyState
            icon={Truck}
            title="No batch jobs yet"
            description="Add a thread, workflow, Evaluation, Agent Optimization, or project ticket to the shelf."
            primaryAction={{ label: "New Job", onClick: () => onCreate(), icon: Plus }}
          />
        }
        noResultsState="No batches match this search."
        onOpen={(row) => onOpen((row as BatchOverviewRow).job)}
        onCreate={() => onCreate()}
        onEdit={(row) => onOpen((row as BatchOverviewRow).job)}
        onRename={(row) => onOpen((row as BatchOverviewRow).job)}
        onDelete={(selectedRows) =>
          onDelete(selectedRows.map((row) => (row as BatchOverviewRow).job))
        }
        rowActions={rowActions}
      />
    </>
  );
}

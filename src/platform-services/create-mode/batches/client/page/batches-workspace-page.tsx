import { AlertCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformLoadingState } from "../../../../../platform-ui/components/composite/loading-state/index.js";
import { PlatformConfirmationModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  listBatchProjects,
  listBatchProjectTickets,
  listBatchTargetResources,
  loadBatchMetronomeManualRunContext,
  prepareBatchProjectTicket,
} from "../batch-target-resources.js";
import {
  type BatchesApiOptions,
  createBatchJob,
  deleteBatchJob,
  getBatchJob,
  listBatchJobs,
  reorderBatchJob,
  runBatchJobAction,
  updateBatchJob,
} from "../batches-api.js";
import type {
  BatchCreatorIdentity,
  BatchJob,
  BatchJobDraft,
  BatchSelectableTargetKind,
  BatchTargetKind,
} from "../batches-types.js";
import { BatchCreateModal, type BatchThreadComposerProps } from "./batch-create-modal.js";
import { BatchesOverviewPage } from "./batches-overview-page.js";

export const BATCH_DRAFT_STORAGE_KEY = "computer_agents_batch_draft_v1";
export const BATCH_DRAFT_EVENT = "computer-agents:open-batch-composer";
export const BATCH_OPEN_STORAGE_KEY = "computer_agents_batch_open_v1";
export const BATCH_OPEN_EVENT = "computer-agents:open-batch";

export interface BatchesWorkspacePageProps {
  shouldLoadData?: boolean;
  backendUrl?: string;
  resourceBackendUrl?: string;
  requestHeaders?: Readonly<Record<string, string>>;
  draftStorageKey?: string;
  controlsPortalId?: string;
  scopePortalId?: string;
  currentUser?: BatchCreatorIdentity;
  threadComposerProps?: BatchThreadComposerProps;
}

function readDraft(storageKey: string): BatchJobDraft | null {
  try {
    const raw = globalThis.sessionStorage?.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as BatchJobDraft)
      : null;
  } catch {
    return null;
  }
}

function removeDraft(storageKey: string) {
  try {
    globalThis.sessionStorage?.removeItem(storageKey);
  } catch {
    // Session storage can be unavailable in hardened browsers.
  }
}

function createComposerIdempotencyKey() {
  const randomId =
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `batch-ui:${randomId}`;
}

function createDraftFromJob(job: BatchJob): BatchJobDraft {
  return {
    name: job.name,
    description: job.description,
    targetKind: job.targetKind,
    targetResourceId: job.targetResourceId,
    targetVersionId: job.targetVersionId,
    definition: job.definition,
    startPolicy: job.startPolicy,
    sourceProjectId: job.sourceProjectId,
    sourceTicketId: job.sourceTicketId,
    idempotencyKey: job.idempotencyKey,
    metadata: job.metadata,
  };
}

export function BatchesWorkspacePage({
  shouldLoadData = true,
  backendUrl = "/api/real/batch-jobs",
  resourceBackendUrl = backendUrl.replace(/\/batch-jobs\/?$/, ""),
  requestHeaders = {},
  draftStorageKey = BATCH_DRAFT_STORAGE_KEY,
  controlsPortalId,
  scopePortalId,
  currentUser,
  threadComposerProps,
}: BatchesWorkspacePageProps) {
  const headersKey = JSON.stringify(requestHeaders || {});
  const normalizedRequestHeaders = useMemo<Readonly<Record<string, string>>>(
    () => JSON.parse(headersKey) as Record<string, string>,
    [headersKey],
  );
  const apiOptions = useMemo<BatchesApiOptions>(
    () => ({
      basePath: backendUrl,
      requestHeaders: { ...normalizedRequestHeaders },
    }),
    [backendUrl, normalizedRequestHeaders],
  );
  const loadTargetResources = useCallback(
    (targetKind: BatchSelectableTargetKind) =>
      listBatchTargetResources(targetKind, {
        baseUrl: resourceBackendUrl,
        requestHeaders: normalizedRequestHeaders,
      }),
    [normalizedRequestHeaders, resourceBackendUrl],
  );
  const loadProjects = useCallback(
    () =>
      listBatchProjects({
        baseUrl: resourceBackendUrl,
        requestHeaders: normalizedRequestHeaders,
      }),
    [normalizedRequestHeaders, resourceBackendUrl],
  );
  const loadMetronomeManualRunContext = useCallback(
    (metronomeId: string, versionId?: string | null) =>
      loadBatchMetronomeManualRunContext(metronomeId, versionId, {
        baseUrl: resourceBackendUrl,
        requestHeaders: normalizedRequestHeaders,
      }),
    [normalizedRequestHeaders, resourceBackendUrl],
  );
  const loadProjectTickets = useCallback(
    (projectId: string) =>
      listBatchProjectTickets(projectId, {
        baseUrl: resourceBackendUrl,
        requestHeaders: normalizedRequestHeaders,
      }),
    [normalizedRequestHeaders, resourceBackendUrl],
  );
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [activeJob, setActiveJob] = useState<BatchJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<BatchJobDraft | null>(null);
  const [deleteCandidates, setDeleteCandidates] = useState<BatchJob[]>([]);
  const [overviewScope, setOverviewScope] = useState<"all" | "created">("all");

  const loadOverview = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const nextJobs = await listBatchJobs(apiOptions);
        setJobs(nextJobs);
        setError("");
        setActiveJob((current) => {
          if (!current) return null;
          return nextJobs.find((job) => job.id === current.id) || current;
        });
      } catch (nextError) {
        if (!silent) {
          setError(nextError instanceof Error ? nextError.message : "Failed to load Batches.");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [apiOptions],
  );

  useEffect(() => {
    if (!shouldLoadData) return;
    void loadOverview();
  }, [loadOverview, shouldLoadData]);

  useEffect(() => {
    if (!shouldLoadData) return;
    const timer = globalThis.setInterval(() => {
      void loadOverview(true);
    }, 5_000);
    return () => globalThis.clearInterval(timer);
  }, [loadOverview, shouldLoadData]);

  const openComposer = useCallback((draft?: BatchJobDraft | null) => {
    setActiveJob(null);
    setCreateDraft({
      ...(draft || {}),
      idempotencyKey: draft?.idempotencyKey || createComposerIdempotencyKey(),
    });
    setModalError("");
    setCreateOpen(true);
  }, []);

  useEffect(() => {
    if (!shouldLoadData) return;
    const stored = readDraft(draftStorageKey);
    if (stored) {
      removeDraft(draftStorageKey);
      openComposer(stored);
    }
    const listener = (event: Event) => {
      const custom = event as CustomEvent<BatchJobDraft>;
      openComposer(custom.detail || readDraft(draftStorageKey));
      removeDraft(draftStorageKey);
    };
    globalThis.addEventListener?.(BATCH_DRAFT_EVENT, listener);
    return () => globalThis.removeEventListener?.(BATCH_DRAFT_EVENT, listener);
  }, [draftStorageKey, openComposer, shouldLoadData]);

  useEffect(() => {
    if (!shouldLoadData) return;
    const openById = (value: unknown) => {
      const id = String(value || "").trim();
      if (!id) return;
      const matching = jobs.find((job) => job.id === id);
      if (matching) {
        setActiveJob(matching);
        setCreateDraft(createDraftFromJob(matching));
        setModalError("");
        setCreateOpen(true);
        return;
      }
      void getBatchJob(id, apiOptions)
        .then(({ job }) => {
          setJobs((current) => [job, ...current.filter((candidate) => candidate.id !== job.id)]);
          setActiveJob(job);
          setCreateDraft(createDraftFromJob(job));
          setModalError("");
          setCreateOpen(true);
        })
        .catch((nextError) => {
          setError(nextError instanceof Error ? nextError.message : "Failed to load this Batch.");
        });
    };
    try {
      const storedId = globalThis.sessionStorage?.getItem(BATCH_OPEN_STORAGE_KEY);
      if (storedId) {
        globalThis.sessionStorage?.removeItem(BATCH_OPEN_STORAGE_KEY);
        openById(storedId);
      }
    } catch {
      // Same-window navigation also dispatches the event below.
    }
    const listener = (event: Event) => {
      openById((event as CustomEvent<string>).detail);
    };
    globalThis.addEventListener?.(BATCH_OPEN_EVENT, listener);
    return () => globalThis.removeEventListener?.(BATCH_OPEN_EVENT, listener);
  }, [apiOptions, jobs, shouldLoadData]);

  const mutate = useCallback(
    async (operation: () => Promise<unknown>): Promise<boolean> => {
      setMutating(true);
      setError("");
      try {
        await operation();
        await loadOverview(true);
        return true;
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Batch operation failed.");
        return false;
      } finally {
        setMutating(false);
      }
    },
    [loadOverview],
  );

  const act = useCallback(
    (job: BatchJob, action: "start" | "hold" | "cancel") =>
      mutate(() => runBatchJobAction(job.id, action, apiOptions)),
    [apiOptions, mutate],
  );

  const openJob = useCallback((job: BatchJob) => {
    setActiveJob(job);
    setCreateDraft(createDraftFromJob(job));
    setModalError("");
    setCreateOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setCreateOpen(false);
    setCreateDraft(null);
    setActiveJob(null);
    setModalError("");
  }, []);

  if (loading) {
    return <PlatformLoadingState centered message="Loading Batches…" />;
  }

  if (error && !jobs.length) {
    return (
      <PlatformEmptyState
        icon={AlertCircle}
        title="Batches could not be loaded"
        description={error}
        primaryAction={{ label: "Retry", onClick: () => void loadOverview() }}
      />
    );
  }

  return (
    <>
      <BatchesOverviewPage
        jobs={jobs}
        loading={loading}
        mutating={mutating}
        onOpen={openJob}
        onCreate={(targetKind) => openComposer(targetKind ? { targetKind } : undefined)}
        onStart={(job) => void act(job, "start")}
        onHold={(job) => void act(job, "hold")}
        onCancel={(job) => void act(job, "cancel")}
        onDelete={(candidates) => setDeleteCandidates([...candidates])}
        onReorder={(job, index) => {
          void mutate(() => reorderBatchJob(job.id, Math.max(0, index), apiOptions));
        }}
        controlsPortalId={controlsPortalId}
        scopePortalId={scopePortalId}
        scope={overviewScope}
        onScopeChange={setOverviewScope}
        currentUser={currentUser}
      />
      <BatchCreateModal
        open={createOpen}
        draft={createDraft}
        mode={activeJob ? (activeJob.status === "held" ? "edit" : "view") : "create"}
        submitting={mutating}
        error={modalError}
        threadComposerProps={threadComposerProps}
        loadTargetResources={loadTargetResources}
        loadMetronomeManualRunContext={loadMetronomeManualRunContext}
        loadProjects={loadProjects}
        loadProjectTickets={loadProjectTickets}
        onClose={() => {
          if (!mutating) closeModal();
        }}
        onSubmit={async (draft, intent) => {
          setMutating(true);
          setModalError("");
          try {
            let resolvedDraft = draft;
            if (
              draft.targetKind === "project_ticket_action" &&
              !String(draft.targetResourceId || "").trim()
            ) {
              const ticketId = String(draft.sourceTicketId || "").trim();
              const projectId = String(draft.sourceProjectId || "").trim();
              const idempotencyKey = `${String(draft.idempotencyKey || createComposerIdempotencyKey())}:prepare-ticket`;
              const prepared = await prepareBatchProjectTicket(ticketId, {
                baseUrl: resourceBackendUrl,
                requestHeaders: normalizedRequestHeaders,
                idempotencyKey,
                runKind: draft.metadata?.runKind === "review" ? "review" : "implementation",
              });
              resolvedDraft = {
                ...draft,
                targetResourceId: prepared.threadId,
                targetVersionId: null,
                definition: {
                  ...(draft.definition || {}),
                  projectId,
                  ticketId,
                  threadId: prepared.threadId,
                  preparedThreadId: prepared.threadId,
                },
                metadata: {
                  ...(draft.metadata || {}),
                  preparedThreadTitle: prepared.threadTitle,
                },
              };
            }
            const saved = activeJob
              ? await updateBatchJob(activeJob.id, resolvedDraft, apiOptions)
              : await createBatchJob(
                  resolvedDraft as BatchJobDraft & { name: string; targetKind: BatchTargetKind },
                  apiOptions,
                );
            setJobs((current) => [saved, ...current.filter((job) => job.id !== saved.id)]);
            if (intent === "start" && activeJob) {
              const started = await runBatchJobAction(saved.id, "start", apiOptions);
              setJobs((current) => [
                started,
                ...current.filter((job) => job.id !== started.id),
              ]);
            }
            closeModal();
            return true;
          } catch (nextError) {
            setModalError(
              nextError instanceof Error
                ? nextError.message
                : activeJob
                  ? intent === "start"
                    ? "The Batch was saved, but could not be started."
                    : "Failed to save Batch."
                  : "Failed to add Batch.",
            );
            return false;
          } finally {
            setMutating(false);
          }
        }}
      />
      <PlatformConfirmationModal
        open={deleteCandidates.length > 0}
        title={
          deleteCandidates.length > 1
            ? `Delete ${deleteCandidates.length} Batches?`
            : deleteCandidates[0]
              ? `Delete ${deleteCandidates[0].name}?`
              : "Delete Batch?"
        }
        description="This permanently removes the selected Batch definitions and their audit history. Native runs already created are retained."
        confirmLabel={deleteCandidates.length > 1 ? "Delete Batches" : "Delete Batch"}
        confirmingLabel="Deleting…"
        tone="destructive"
        onCancel={() => setDeleteCandidates([])}
        onConfirm={async () => {
          if (!deleteCandidates.length) return;
          const candidates = [...deleteCandidates];
          setMutating(true);
          setError("");
          const results = await Promise.allSettled(
            candidates.map((candidate) => deleteBatchJob(candidate.id, apiOptions)),
          );
          const deletedIds = new Set(
            candidates
              .filter((_, index) => results[index]?.status === "fulfilled")
              .map((candidate) => candidate.id),
          );
          setJobs((current) => current.filter((job) => !deletedIds.has(job.id)));
          if (activeJob && deletedIds.has(activeJob.id)) {
            closeModal();
          }
          const failed = results.filter((result) => result.status === "rejected");
          if (failed.length) {
            const firstFailure = failed[0] as PromiseRejectedResult;
            setError(
              firstFailure.reason instanceof Error
                ? firstFailure.reason.message
                : `Failed to delete ${failed.length} Batch${failed.length === 1 ? "" : "es"}.`,
            );
          }
          setDeleteCandidates([]);
          await loadOverview(true);
          setMutating(false);
        }}
      />
      {error && jobs.length ? (
        <div className="batches-page-error" role="alert">
          {error}
        </div>
      ) : null}
    </>
  );
}

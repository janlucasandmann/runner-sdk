import { Bookmark, Code2, SquarePen, Trash2, Undo2 } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { SecurityServiceRepository } from "../api/security-repository.js";
import type {
  SecurityRepositoryDetail,
  SecurityRepositoryVersion,
  SecurityRepositoryVersionSnapshot,
  SecurityScanPolicy,
  SecurityThreatModel,
} from "../domain/index.js";
import { PlatformDiffViewer } from "../../../../../platform-ui/components/composite/diff-viewer/index.js";
import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformVersionHistorySidebar,
  PlatformVersionPublishControl,
  PlatformVersionSaveDialog,
  usePlatformVersionNavigationGuard,
  type PlatformVersionNavigationGuardRegistrar,
} from "../../../../../platform-ui/components/composite/versioning/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";

export interface SecurityRepositoryHeaderState {
  mode: "overview" | "detail";
  title: string;
  resourceType?: "security_repository" | "security_run" | "security_finding";
  resourceId?: string;
  parentTitle?: string;
  onParentClick?: () => void;
  activeSection?: string;
  sectionOptions?: readonly { value: string; label: string }[];
  onSectionChange?: (section: string) => void;
  versionNumber?: number | null;
  versionIsLatest?: boolean;
  versionBusy?: boolean;
  onVersionClick?: () => void;
  actionsOpen?: boolean;
  onActionsOpenChange?: (open: boolean) => void;
  onDelete?: () => void;
  onOverviewClick?: () => void;
}

export interface SecurityRepositoryVersionRenderState {
  detail: SecurityRepositoryDetail;
  busy: boolean;
  onPolicyChange: (policy: SecurityScanPolicy) => void;
  onThreatModelChange: (threatModel: SecurityThreatModel) => void;
}

export interface SecurityRepositoryVersionControlProps {
  detail: SecurityRepositoryDetail;
  repository: SecurityServiceRepository;
  controlsPortalId?: string;
  versionsDrawerPortalId?: string;
  busy?: boolean;
  onBack: () => void;
  activeSection?: string;
  sectionOptions?: readonly { value: string; label: string }[];
  onSectionChange?: (section: string) => void;
  headerLeadingControls?: ReactNode;
  onReload: () => Promise<SecurityRepositoryDetail | null>;
  onDelete: () => void;
  onHeaderChange?: (state: SecurityRepositoryHeaderState) => void;
  onVersionsSidebarOpenChange?: (open: boolean) => void;
  onNavigationGuardChange?: PlatformVersionNavigationGuardRegistrar;
  children: (state: SecurityRepositoryVersionRenderState) => ReactNode;
}

interface VersionDiff {
  filePath: string;
  fileContent: string;
  diffContent: string;
  additions: number;
  deletions: number;
}

interface CompareSource {
  id: string;
  label: string;
  snapshot: SecurityRepositoryVersionSnapshot;
}

function cloneSnapshot(
  snapshot: SecurityRepositoryVersionSnapshot,
): SecurityRepositoryVersionSnapshot {
  return JSON.parse(
    JSON.stringify(snapshot),
  ) as SecurityRepositoryVersionSnapshot;
}

function snapshotFromDetail(
  detail: SecurityRepositoryDetail,
): SecurityRepositoryVersionSnapshot {
  if (!detail.policy || !detail.threatModel) {
    throw new Error("Security repository configuration is incomplete.");
  }
  return cloneSnapshot({
    schemaVersion: 1,
    policy: detail.policy.value,
    threatModel: detail.threatModel.value,
  });
}

function snapshotsEqual(
  left: SecurityRepositoryVersionSnapshot,
  right: SecurityRepositoryVersionSnapshot,
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function buildVersionDiff(
  before: SecurityRepositoryVersionSnapshot,
  after: SecurityRepositoryVersionSnapshot,
): VersionDiff {
  const filePath = "security-repository.json";
  const beforeContent = JSON.stringify(before, null, 2);
  const fileContent = JSON.stringify(after, null, 2);
  if (beforeContent === fileContent) {
    return {
      filePath,
      fileContent,
      diffContent: "",
      additions: 0,
      deletions: 0,
    };
  }
  const beforeLines = beforeContent.split("\n");
  const afterLines = fileContent.split("\n");
  return {
    filePath,
    fileContent,
    additions: afterLines.length,
    deletions: beforeLines.length,
    diffContent: [
      `--- a/${filePath}`,
      `+++ b/${filePath}`,
      `@@ -1,${beforeLines.length} +1,${afterLines.length} @@`,
      ...beforeLines.map((line) => `-${line}`),
      ...afterLines.map((line) => `+${line}`),
    ].join("\n"),
  };
}

function getPortalTarget(id: string): HTMLElement | null {
  return typeof document !== "undefined" && id
    ? document.getElementById(id)
    : null;
}

function getActiveVersion(versions: readonly SecurityRepositoryVersion[]) {
  return (
    versions.find((version) => version.status === "published") ||
    versions[0] ||
    null
  );
}

function formatVersionTimestamp(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
}

export function SecurityRepositoryVersionControl({
  detail,
  repository,
  controlsPortalId = "",
  versionsDrawerPortalId = "",
  busy = false,
  onBack,
  activeSection,
  sectionOptions,
  onSectionChange,
  headerLeadingControls,
  onReload,
  onDelete,
  onHeaderChange,
  onVersionsSidebarOpenChange,
  onNavigationGuardChange,
  children,
}: SecurityRepositoryVersionControlProps) {
  const repositoryId = detail.repository.id;
  const [versions, setVersions] = useState<SecurityRepositoryVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState("");
  const [baseline, setBaseline] = useState(() => snapshotFromDetail(detail));
  const [draft, setDraft] = useState(() => snapshotFromDetail(detail));
  const [versionsLoading, setVersionsLoading] = useState(true);
  const [versionBusy, setVersionBusy] = useState(false);
  const [versionError, setVersionError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [publishMenuOpen, setPublishMenuOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [saveDialog, setSaveDialog] = useState<{
    mode: "current" | "new";
    key: string;
  } | null>(null);
  const [editVersion, setEditVersion] =
    useState<SecurityRepositoryVersion | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareLeftId, setCompareLeftId] = useState("");
  const [compareRightId, setCompareRightId] = useState("current-editor");
  const [controlsTarget, setControlsTarget] = useState<HTMLElement | null>(
    null,
  );
  const [drawerTarget, setDrawerTarget] = useState<HTMLElement | null>(null);
  const onDeleteRef = useRef(onDelete);
  onDeleteRef.current = onDelete;

  const selectedVersion = useMemo(
    () =>
      versions.find((version) => version.id === selectedVersionId) ||
      getActiveVersion(versions),
    [selectedVersionId, versions],
  );
  const activeVersion = useMemo(() => getActiveVersion(versions), [versions]);
  const latestVersionNumber = useMemo(
    () =>
      versions.reduce(
        (latest, version) => Math.max(latest, Number(version.version) || 0),
        0,
      ),
    [versions],
  );
  const hasChanges = useMemo(
    () => !snapshotsEqual(baseline, draft),
    [baseline, draft],
  );
  const isBusy = busy || versionBusy || versionsLoading;
  const diff = useMemo(
    () => buildVersionDiff(baseline, draft),
    [baseline, draft],
  );

  const loadVersions = useCallback(
    async (signal?: AbortSignal) => {
      const nextVersions = await repository.listRepositoryVersions(
        repositoryId,
        signal,
      );
      setVersions(nextVersions);
      return nextVersions;
    },
    [repository, repositoryId],
  );

  useEffect(() => {
    const controller = new AbortController();
    const initialSnapshot = snapshotFromDetail(detail);
    setBaseline(initialSnapshot);
    setDraft(cloneSnapshot(initialSnapshot));
    setSelectedVersionId("");
    setVersions([]);
    setVersionsLoading(true);
    setVersionError("");
    void loadVersions(controller.signal)
      .then((nextVersions) => {
        if (controller.signal.aborted) return;
        const active = getActiveVersion(nextVersions);
        setSelectedVersionId(active?.id || "");
        if (active?.snapshot) {
          setBaseline(cloneSnapshot(active.snapshot));
          setDraft(cloneSnapshot(active.snapshot));
        }
      })
      .catch((error) => {
        if ((error as { name?: string })?.name !== "AbortError") {
          setVersionError(
            error instanceof Error ? error.message : "Failed to load versions.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setVersionsLoading(false);
      });
    return () => controller.abort();
  }, [detail.repository.id, loadVersions]);

  useEffect(() => {
    setControlsTarget(getPortalTarget(controlsPortalId));
    setDrawerTarget(getPortalTarget(versionsDrawerPortalId));
  }, [controlsPortalId, historyOpen, versionsDrawerPortalId]);

  useEffect(() => {
    onVersionsSidebarOpenChange?.(historyOpen);
    return () => onVersionsSidebarOpenChange?.(false);
  }, [historyOpen, onVersionsSidebarOpenChange]);

  const openHistory = useCallback(() => {
    setActionsOpen(false);
    setPublishMenuOpen(false);
    setHistoryOpen(true);
  }, []);
  const handleDelete = useCallback(() => onDeleteRef.current(), []);

  useEffect(() => {
    if (!actionsOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActionsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [actionsOpen]);

  useEffect(() => {
    if (!onHeaderChange) return undefined;
    const versionNumber = selectedVersion
      ? Number(selectedVersion.version)
      : null;
    onHeaderChange({
      mode: "detail",
      title: detail.repository.fullName,
      resourceType: "security_repository",
      resourceId: repositoryId,
      activeSection,
      sectionOptions,
      onSectionChange,
      versionNumber: Number.isFinite(versionNumber) ? versionNumber : null,
      versionIsLatest:
        Number.isFinite(versionNumber) && versionNumber === latestVersionNumber,
      versionBusy: isBusy,
      onVersionClick: openHistory,
      actionsOpen,
      onActionsOpenChange: setActionsOpen,
      onDelete: handleDelete,
      onOverviewClick: onBack,
    });
  }, [
    detail.repository.fullName,
    activeSection,
    actionsOpen,
    isBusy,
    latestVersionNumber,
    onBack,
    onHeaderChange,
    handleDelete,
    onSectionChange,
    openHistory,
    repositoryId,
    sectionOptions,
    selectedVersion,
  ]);

  const revertDraft = useCallback(() => {
    setDraft(cloneSnapshot(baseline));
    setVersionError("");
  }, [baseline]);

  usePlatformVersionNavigationGuard({
    dirty: hasChanges,
    guardId: "security-repository-unsaved-changes",
    resourceId: repositoryId,
    resourceName: detail.repository.fullName,
    resourceType: "Security repository",
    onDiscard: revertDraft,
    onNavigationGuardChange,
  });

  const resetFromPublishedState = useCallback(
    async (nextVersions?: SecurityRepositoryVersion[]) => {
      const [nextDetail, resolvedVersions] = await Promise.all([
        onReload(),
        nextVersions ? Promise.resolve(nextVersions) : loadVersions(),
      ]);
      const active = getActiveVersion(resolvedVersions);
      const nextSnapshot =
        nextDetail?.policy && nextDetail.threatModel
          ? snapshotFromDetail(nextDetail)
          : active?.snapshot || draft;
      setVersions(resolvedVersions);
      setSelectedVersionId(active?.id || "");
      setBaseline(cloneSnapshot(nextSnapshot));
      setDraft(cloneSnapshot(nextSnapshot));
    },
    [draft, loadVersions, onReload],
  );

  const publishVersion = useCallback(
    async (
      version: SecurityRepositoryVersion,
      snapshot: SecurityRepositoryVersionSnapshot = version.snapshot,
      description = version.description,
    ) => {
      setVersionBusy(true);
      setVersionError("");
      try {
        const result = await repository.publishRepositoryVersion(
          repositoryId,
          version.id,
          {
            snapshot,
            description,
          },
        );
        await resetFromPublishedState(result.versions);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "The version could not be published.";
        setVersionError(message);
        throw error;
      } finally {
        setVersionBusy(false);
      }
    },
    [repository, repositoryId, resetFromPublishedState],
  );

  const submitSave = useCallback(
    async ({
      mode,
      description,
    }: {
      mode: "current" | "new";
      description: string;
    }) => {
      setVersionBusy(true);
      setVersionError("");
      try {
        if (mode === "current" && selectedVersion) {
          const result = await repository.publishRepositoryVersion(
            repositoryId,
            selectedVersion.id,
            { snapshot: draft, description },
          );
          await resetFromPublishedState(result.versions);
        } else {
          const result = await repository.createRepositoryVersion(
            repositoryId,
            {
              snapshot: draft,
              description,
              publish: true,
            },
          );
          await resetFromPublishedState(result.versions);
        }
        setSaveDialog(null);
      } catch (error) {
        setVersionError(
          error instanceof Error
            ? error.message
            : "The version could not be saved.",
        );
        throw error;
      } finally {
        setVersionBusy(false);
      }
    },
    [draft, repository, repositoryId, resetFromPublishedState, selectedVersion],
  );

  const selectVersion = useCallback((version: SecurityRepositoryVersion) => {
    setSelectedVersionId(version.id);
    setBaseline(cloneSnapshot(version.snapshot));
    setDraft(cloneSnapshot(version.snapshot));
    setVersionError("");
  }, []);

  const deleteVersion = useCallback(
    async (version: SecurityRepositoryVersion) => {
      if (!window.confirm(`Delete version ${version.version}?`)) return;
      setVersionBusy(true);
      setVersionError("");
      try {
        await repository.deleteRepositoryVersion(repositoryId, version.id);
        const nextVersions = await loadVersions();
        const nextSelected = getActiveVersion(nextVersions);
        if (
          !nextVersions.some((item) => item.id === selectedVersionId) &&
          nextSelected
        ) {
          selectVersion(nextSelected);
        }
      } catch (error) {
        setVersionError(
          error instanceof Error
            ? error.message
            : "The version could not be deleted.",
        );
      } finally {
        setVersionBusy(false);
      }
    },
    [loadVersions, repository, repositoryId, selectVersion, selectedVersionId],
  );

  const compareSources = useMemo<CompareSource[]>(
    () => [
      { id: "current-editor", label: "Current editor", snapshot: draft },
      ...versions.map((version) => ({
        id: version.id,
        label: `v${version.version}${version.status === "published" ? " · Production" : ""}`,
        snapshot: version.snapshot,
      })),
    ],
    [draft, versions],
  );
  const leftSource =
    compareSources.find((source) => source.id === compareLeftId) ||
    compareSources[1] ||
    compareSources[0];
  const rightSource =
    compareSources.find((source) => source.id === compareRightId) ||
    compareSources[0];
  const compareDiff = useMemo(
    () => buildVersionDiff(leftSource.snapshot, rightSource.snapshot),
    [leftSource, rightSource],
  );

  const versionedDetail = useMemo<SecurityRepositoryDetail>(
    () => ({
      ...detail,
      policy: detail.policy
        ? { ...detail.policy, value: draft.policy }
        : detail.policy,
      threatModel: detail.threatModel
        ? { ...detail.threatModel, value: draft.threatModel }
        : detail.threatModel,
    }),
    [detail, draft],
  );

  const publishControl = (
    <PlatformVersionPublishControl
      open={publishMenuOpen}
      actions={[
        {
          id: "revert",
          label: "Revert Changes",
          icon: Undo2,
          disabled: !hasChanges,
          onClick: revertDraft,
        },
      ]}
      active={publishMenuOpen}
      disabled={isBusy || !hasChanges}
      menuDisabled={isBusy || !hasChanges}
      label="Save Changes"
      leading={<Bookmark strokeWidth={1.8} />}
      publishAriaLabel="Save repository security changes"
      onOpenChange={setPublishMenuOpen}
      onPublish={() =>
        setSaveDialog({
          mode: selectedVersion ? "current" : "new",
          key: String(Date.now()),
        })
      }
    />
  );
  const headerControls = (
    <div className="develop-security-version-controls">
      {headerLeadingControls}
      {publishControl}
    </div>
  );

  return (
    <>
      {children({
        detail: versionedDetail,
        busy: isBusy,
        onPolicyChange: (policy) =>
          setDraft((current) => ({ ...current, policy })),
        onThreatModelChange: (threatModel) =>
          setDraft((current) => ({ ...current, threatModel })),
      })}

      {controlsTarget
        ? createPortal(headerControls, controlsTarget)
        : headerControls}

      <PlatformVersionHistorySidebar<SecurityRepositoryVersion>
        open={historyOpen}
        title="Version history"
        sectionTitle="All Versions"
        className="playground-agent-versions-sidebar develop-security-version-history"
        width="var(--playground-thread-task-detail-width)"
        portal={Boolean(drawerTarget)}
        portalTarget={drawerTarget}
        versions={versions}
        activeVersionId={activeVersion?.id || ""}
        selectedVersionId={selectedVersion?.id || ""}
        loading={versionsLoading}
        loadingMessage="Loading versions"
        error={versionError || null}
        emptyDescription="Save changes to create this repository's first version."
        busy={isBusy}
        onClose={() => setHistoryOpen(false)}
        onCreateVersion={() =>
          setSaveDialog({ mode: "new", key: String(Date.now()) })
        }
        onSelectVersion={(_versionId, version) => selectVersion(version)}
        onPublishVersion={(_versionId, version) =>
          publishVersion(
            version,
            selectedVersion?.id === version.id && hasChanges
              ? draft
              : version.snapshot,
          )
        }
        canPublishVersion={(version) =>
          version.status === "published"
            ? selectedVersion?.id === version.id && hasChanges
            : !hasChanges
        }
        onViewChanges={() => {
          setCompareLeftId(selectedVersion?.id || activeVersion?.id || "");
          setCompareRightId("current-editor");
          setCompareOpen(true);
        }}
        getVersionCreatedAt={(version) =>
          formatVersionTimestamp(
            version.createdAt || version.updatedAt || version.publishedAt || "",
          )
        }
        getVersionActions={(version) => [
          {
            id: "edit",
            label: "Edit description",
            icon: SquarePen,
            onSelect: () => {
              setEditVersion(version);
              setEditDescription(version.description || "");
            },
          },
          {
            id: "compare",
            label: "View Changes",
            icon: Code2,
            onSelect: () => {
              setCompareLeftId(version.id);
              setCompareRightId("current-editor");
              setCompareOpen(true);
            },
          },
          {
            id: "delete",
            label: "Delete version",
            icon: Trash2,
            danger: true,
            disabled: version.status === "published" || versions.length <= 1,
            onSelect: () => deleteVersion(version),
          },
        ]}
      />

      <PlatformVersionSaveDialog
        open={Boolean(saveDialog)}
        title="Review changes"
        currentVersion={
          selectedVersion?.version ?? activeVersion?.version ?? null
        }
        nextVersion={latestVersionNumber + 1}
        currentDescription={selectedVersion?.description || ""}
        initialMode={saveDialog?.mode || "new"}
        canSaveCurrent={Boolean(selectedVersion)}
        instanceKey={saveDialog?.key}
        pending={versionBusy}
        error={versionError || null}
        changes={
          hasChanges
            ? [
                {
                  id: diff.filePath,
                  label: diff.filePath,
                  content: (
                    <PlatformDiffViewer
                      filePath={diff.filePath}
                      diffContent={diff.diffContent}
                      fileContent={diff.fileContent}
                      additions={diff.additions}
                      deletions={diff.deletions}
                      hideTopbar
                      embedded
                      defaultExpanded
                      maxHeight={330}
                    />
                  ),
                },
              ]
            : []
        }
        emptyChanges="No changes were found between the editor and the selected version."
        onClose={() => {
          if (!versionBusy) setSaveDialog(null);
        }}
        onSubmit={submitSave}
      />

      <PlatformModal
        open={Boolean(editVersion)}
        title={editVersion ? `Edit v${editVersion.version}` : "Edit version"}
        size="small"
        onClose={() => {
          if (!versionBusy) setEditVersion(null);
        }}
        footer={
          <>
            <PlatformSecondaryButton
              size="medium"
              disabled={versionBusy}
              onClick={() => setEditVersion(null)}
            >
              Cancel
            </PlatformSecondaryButton>
            <PlatformPrimaryButton
              size="medium"
              disabled={versionBusy || !editVersion}
              onClick={() => {
                if (!editVersion) return;
                setVersionBusy(true);
                setVersionError("");
                void repository
                  .updateRepositoryVersion(repositoryId, editVersion.id, {
                    description: editDescription,
                  })
                  .then((updated) => {
                    setVersions((current) =>
                      current.map((version) =>
                        version.id === updated.id ? updated : version,
                      ),
                    );
                    setEditVersion(null);
                  })
                  .catch((error) =>
                    setVersionError(
                      error instanceof Error
                        ? error.message
                        : "The description could not be saved.",
                    ),
                  )
                  .finally(() => setVersionBusy(false));
              }}
            >
              Save
            </PlatformPrimaryButton>
          </>
        }
      >
        <label className="develop-security-version-description-field">
          <span>Version description</span>
          <textarea
            rows={5}
            maxLength={240}
            value={editDescription}
            disabled={versionBusy}
            onChange={(event) => setEditDescription(event.target.value)}
            placeholder="Summarize what changed in this version"
          />
        </label>
      </PlatformModal>

      <PlatformModal
        open={compareOpen}
        title="Changes"
        size="large"
        maxHeight="min(760px, calc(100dvh - 48px))"
        onClose={() => setCompareOpen(false)}
        footer={
          <PlatformSecondaryButton
            size="medium"
            onClick={() => setCompareOpen(false)}
          >
            Close
          </PlatformSecondaryButton>
        }
      >
        <div className="develop-security-version-compare-controls">
          <PlatformSelector
            value={leftSource.id}
            ariaLabel="Base repository version"
            options={compareSources.map((source) => ({
              value: source.id,
              label: source.label,
            }))}
            onValueChange={setCompareLeftId}
          />
          <span aria-hidden="true">→</span>
          <PlatformSelector
            value={rightSource.id}
            ariaLabel="Target repository version"
            options={compareSources.map((source) => ({
              value: source.id,
              label: source.label,
            }))}
            onValueChange={setCompareRightId}
          />
        </div>
        <PlatformDiffViewer
          filePath={compareDiff.filePath}
          diffContent={compareDiff.diffContent}
          fileContent={compareDiff.fileContent}
          additions={compareDiff.additions}
          deletions={compareDiff.deletions}
          emptyMessage="No differences between the selected versions."
          embedded
          defaultExpanded
          maxHeight={520}
        />
      </PlatformModal>
    </>
  );
}

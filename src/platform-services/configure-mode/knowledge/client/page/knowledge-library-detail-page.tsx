import {
  Bookmark,
  Copy,
  LibraryBig,
  Send,
  SquarePen,
  Trash2,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  buildPlatformTeamAccessMetadata,
  getPlatformSharedTeamIds,
} from "../../../../../platform-resources/access-control/index.js";
import {
  PlatformCodeEditorWorkspace,
  type PlatformCodeEditorFile,
} from "../../../../../platform-ui/components/composite/code-editor-workspace/index.js";
import { PlatformDeploymentMap } from "../../../../../platform-ui/components/composite/deployment-map/index.js";
import { PlatformDiffViewer } from "../../../../../platform-ui/components/composite/diff-viewer/index.js";
import { PlatformConfirmationModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import type { PlatformOwnerOption } from "../../../../../platform-ui/components/composite/owner-selector/index.js";
import {
  PlatformResourceRenameModal,
  PlatformResourceShareModal,
  type PlatformResourceShareTeam,
} from "../../../../../platform-ui/components/composite/resource-action-modals/index.js";
import { PlatformResourceDetailSidebar } from "../../../../../platform-ui/components/composite/resource-detail-sidebar/index.js";
import {
  PlatformResourceActionMenuItem,
  PlatformResourceActionsDivider,
  PlatformResourceActionsInformation,
  PlatformResourceActionsMenu,
  PlatformResourceHeaderActions,
  PlatformResourceVersionLabel,
  PlatformResourceVersionHistoryMenuItem,
} from "../../../../../platform-ui/components/composite/resource-header-actions/index.js";
import {
  PlatformVersionHistorySidebar,
  PlatformVersionChangesPage,
  PlatformVersionSaveDialog,
  type PlatformVersionChangesFile,
  type PlatformVersionSaveDetails,
} from "../../../../../platform-ui/components/composite/versioning/index.js";
import { PlatformLoadingState } from "../../../../../platform-ui/components/composite/loading-state/index.js";
import { PlatformPrimaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformCheckbox } from "../../../../../platform-ui/components/ui/checkbox/index.js";
import { PlatformLabel } from "../../../../../platform-ui/components/ui/label/index.js";
import { PlatformSwitch } from "../../../../../platform-ui/components/ui/switch/index.js";
import { MarkdownResourceDetailPage } from "../../../../../platform-ui/pages/details/index.js";
import type { KnowledgeApi } from "../api/index.js";
import type {
  KnowledgeDocument,
  KnowledgeLibrary,
  KnowledgeLibraryVersion,
} from "../domain/index.js";
import {
  KnowledgeAccessSettings,
  normalizeKnowledgeAccessTeam,
  type KnowledgeAccessTeam,
} from "./knowledge-access-settings.js";

type KnowledgeDetailTab = "general" | "settings";

export interface KnowledgeLibraryDetailPageProps {
  library: KnowledgeLibrary;
  api: KnowledgeApi;
  controlsPortalId?: string;
  sectionControlsPortalId?: string;
  titleActionsPortalId?: string;
  versionsDrawerPortalId?: string;
  workspaceTeams?: readonly unknown[];
  workspaceTeamsLoading?: boolean;
  workspaceTeamMembers?: readonly unknown[];
  workspaceTeamMembersTeamId?: string;
  activeOrganizationId?: string;
  onWorkspaceTeamsRequest?: () => void;
  onWorkspaceTeamMembersRequest?: (teamId: string) => void | Promise<void>;
  onVersionsSidebarOpenChange?: (open: boolean) => void;
  onLibraryChange: (library: KnowledgeLibrary) => void;
  onReload: () => Promise<void>;
  onLibraryDeleted?: (libraryId: string) => void;
  onStartThread?: (library: KnowledgeLibrary) => void;
}

interface KnowledgeDocumentDraft {
  title: string;
  markdown: string;
  initialTitle: string;
  initialMarkdown: string;
  revisionId: string;
}

function createDocumentDrafts(documents: readonly KnowledgeDocument[]) {
  return Object.fromEntries(documents.map((document) => [document.id, {
    title: document.title,
    markdown: document.markdown,
    initialTitle: document.title,
    initialMarkdown: document.markdown,
    revisionId: document.revisionId,
  } satisfies KnowledgeDocumentDraft]));
}

function usePortalTarget(id?: string) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!id || typeof document === "undefined") {
      setTarget(null);
      return undefined;
    }
    const resolveTarget = () => setTarget(document.getElementById(id));
    resolveTarget();
    const observer = new MutationObserver(resolveTarget);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [id]);
  return target;
}

interface KnowledgeVersionChangesState {
  leftVersionId: string;
  rightVersionId: string;
}

function formatTimestamp(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));
}

function buildWholeFileDiff(filePath: string, before: string, after: string) {
  const beforeLines = String(before).replace(/\r\n?/g, "\n").split("\n");
  const afterLines = String(after).replace(/\r\n?/g, "\n").split("\n");
  const oldCount = beforeLines.length;
  const newCount = afterLines.length;
  return {
    filePath,
    diffContent: [
      `--- a/${filePath}`,
      `+++ b/${filePath}`,
      `@@ -1,${oldCount} +1,${newCount} @@`,
      ...beforeLines.map((line) => `-${line}`),
      ...afterLines.map((line) => `+${line}`),
    ].join("\n"),
    fileContent: after,
    additions: newCount,
    deletions: oldCount,
  };
}

function buildKnowledgeVersionDiffFiles(
  leftVersion: KnowledgeLibraryVersion | null,
  rightVersion: KnowledgeLibraryVersion | null,
  leftDocuments: readonly KnowledgeDocument[],
  rightDocuments: readonly KnowledgeDocument[],
): PlatformVersionChangesFile[] {
  if (!leftVersion || !rightVersion) return [];
  const files: PlatformVersionChangesFile[] = [];
  const leftMetadata = JSON.stringify({
    name: leftVersion.name || "",
    description: leftVersion.description || "",
  }, null, 2);
  const rightMetadata = JSON.stringify({
    name: rightVersion.name || "",
    description: rightVersion.description || "",
  }, null, 2);
  if (leftMetadata !== rightMetadata) {
    files.push({
      id: "knowledge-library-metadata",
      label: "library.json",
      ...buildWholeFileDiff("library.json", leftMetadata, rightMetadata),
    });
  }

  const leftById = new Map(leftDocuments.map((document) => [document.id, document]));
  const rightById = new Map(rightDocuments.map((document) => [document.id, document]));
  const documentIds = new Set([...leftById.keys(), ...rightById.keys()]);
  documentIds.forEach((documentId) => {
    const leftDocument = leftById.get(documentId);
    const rightDocument = rightById.get(documentId);
    const before = leftDocument
      ? `# ${leftDocument.title}\n\n${leftDocument.markdown}`
      : "";
    const after = rightDocument
      ? `# ${rightDocument.title}\n\n${rightDocument.markdown}`
      : "";
    if (before === after) return;
    const title = rightDocument?.title || leftDocument?.title || "document";
    const filePath = `${title.replace(/[\\/:*?\"<>|]/g, "-") || "document"}.md`;
    files.push({
      id: documentId,
      label: filePath,
      ...buildWholeFileDiff(filePath, before, after),
    });
  });
  return files;
}

interface KnowledgeOwnerIdentity {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function normalizeOwnerCandidate(value: unknown): KnowledgeOwnerIdentity | null {
  const source = asRecord(value);
  const metadata = asRecord(source.metadata);
  const candidateSources = [
    source,
    asRecord(source.user),
    asRecord(source.profile),
    asRecord(source.account),
    asRecord(source.member),
    asRecord(source.identity),
    metadata,
    asRecord(metadata.user),
    asRecord(metadata.profile),
    asRecord(metadata.account),
    asRecord(metadata.member),
  ];
  const read = (...keys: string[]) => {
    for (const key of keys) {
      for (const candidate of candidateSources) {
        const candidateValue = String(candidate[key] || "").trim();
        if (candidateValue) return candidateValue;
      }
    }
    return "";
  };
  const id = read("userId", "user_id", "uid", "id", "memberId", "member_id");
  const email = read("email", "emailAddress", "email_address", "mail").toLowerCase();
  if (!id && !email) return null;
  return {
    id: id || email,
    name: read("name", "displayName", "display_name", "fullName", "full_name") || email || id,
    email,
    avatarUrl: read("avatarUrl", "avatar_url", "photoUrl", "photoURL", "picture", "imageUrl"),
  };
}

export function KnowledgeLibraryDetailPage({
  library,
  api,
  controlsPortalId,
  sectionControlsPortalId,
  titleActionsPortalId,
  versionsDrawerPortalId,
  workspaceTeams = [],
  workspaceTeamsLoading = false,
  workspaceTeamMembers = [],
  workspaceTeamMembersTeamId = "",
  activeOrganizationId = "",
  onWorkspaceTeamsRequest,
  onWorkspaceTeamMembersRequest,
  onVersionsSidebarOpenChange,
  onLibraryChange,
  onReload,
  onLibraryDeleted,
  onStartThread,
}: KnowledgeLibraryDetailPageProps) {
  const controlsPortal = usePortalTarget(controlsPortalId);
  const sectionPortal = usePortalTarget(sectionControlsPortalId);
  const actionsPortal = usePortalTarget(titleActionsPortalId);
  const versionsPortal = usePortalTarget(versionsDrawerPortalId);
  const [activeTab, setActiveTab] = useState<KnowledgeDetailTab>("general");
  const [name, setName] = useState(library.name);
  const [description, setDescription] = useState(library.description);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveDialogKey, setSaveDialogKey] = useState(0);
  const [saveInitialMode, setSaveInitialMode] = useState<"current" | "new">("new");
  const [saveError, setSaveError] = useState("");
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versionChangesState, setVersionChangesState] = useState<KnowledgeVersionChangesState | null>(null);
  const [versionChangesDocuments, setVersionChangesDocuments] = useState<{
    left: KnowledgeDocument[];
    right: KnowledgeDocument[];
  }>({ left: [], right: [] });
  const [versionChangesLoading, setVersionChangesLoading] = useState(false);
  const [versionChangesError, setVersionChangesError] = useState("");
  const [titleActionsOpen, setTitleActionsOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedShareTeamIds, setSelectedShareTeamIds] = useState<string[]>([]);
  const [shareError, setShareError] = useState("");
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameError, setRenameError] = useState("");
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [viewedVersionId, setViewedVersionId] = useState(library.currentVersionId);
  const [viewedDocuments, setViewedDocuments] = useState<KnowledgeDocument[] | null>(null);
  const currentDocuments = useMemo(
    () => (viewedDocuments || library.documents || [])
      .filter((document) => !document.archived)
      .sort((left, right) => (
        Number(left.sortOrder || 0) - Number(right.sortOrder || 0)
        || left.title.localeCompare(right.title)
      )),
    [library.documents, viewedDocuments],
  );
  const [activeDocumentId, setActiveDocumentId] = useState(
    library.homeDocumentId || currentDocuments[0]?.id || "",
  );
  const [documentDrafts, setDocumentDrafts] = useState<Record<string, KnowledgeDocumentDraft>>(
    () => createDocumentDrafts(currentDocuments),
  );
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(new Set());
  const [archiveDocuments, setArchiveDocuments] = useState<KnowledgeDocument[]>([]);
  const [accessDetailOpen, setAccessDetailOpen] = useState(false);
  const [ownerSelectorOpen, setOwnerSelectorOpen] = useState(false);
  const [ownerCandidatesLoading, setOwnerCandidatesLoading] = useState(false);
  const [ownerCandidates, setOwnerCandidates] = useState<KnowledgeOwnerIdentity[]>([]);
  const [workspaceTeamMembersById, setWorkspaceTeamMembersById] = useState<
    Record<string, readonly unknown[]>
  >({});
  const workspaceTeamMemberRequestsRef = useRef(new Set<string>());
  const teamsRequestedForOrganizationRef = useRef("");
  const isHistorical = viewedVersionId !== library.currentVersionId;
  const documentRevisionSignature = currentDocuments
    .map((document) => `${document.id}:${document.revisionId}`)
    .join("|");

  useEffect(() => {
    setName(library.name);
    setDescription(library.description);
    setViewedVersionId(library.currentVersionId);
    setViewedDocuments(null);
    setSaveDialogOpen(false);
    setSaveError("");
    setTitleActionsOpen(false);
    setShareModalOpen(false);
    setSelectedShareTeamIds([]);
    setShareError("");
    setRenameModalOpen(false);
    setRenameError("");
    setDeleteConfirmationOpen(false);
    setOwnerSelectorOpen(false);
    setOwnerCandidates([]);
    setVersionsOpen(false);
    setVersionChangesState(null);
    setVersionChangesDocuments({ left: [], right: [] });
    setVersionChangesError("");
  }, [library.id, library.name, library.description, library.currentVersionId]);

  useEffect(() => {
    setOwnerSelectorOpen(false);
    setOwnerCandidates([]);
  }, [activeOrganizationId]);

  useEffect(() => {
    setWorkspaceTeamMembersById({});
    workspaceTeamMemberRequestsRef.current = new Set();
  }, [activeOrganizationId, library.id]);

  useEffect(() => {
    const teamId = String(workspaceTeamMembersTeamId || "").trim();
    if (!teamId || workspaceTeamsLoading) return;
    setWorkspaceTeamMembersById((current) => {
      if (current[teamId] === workspaceTeamMembers) return current;
      return { ...current, [teamId]: workspaceTeamMembers };
    });
    workspaceTeamMemberRequestsRef.current.delete(teamId);
  }, [workspaceTeamMembers, workspaceTeamMembersTeamId, workspaceTeamsLoading]);

  const requestWorkspaceTeamMembers = useCallback((teamId: string) => {
    const normalizedTeamId = String(teamId || "").trim();
    if (
      !normalizedTeamId
      || Object.prototype.hasOwnProperty.call(workspaceTeamMembersById, normalizedTeamId)
      || workspaceTeamMemberRequestsRef.current.has(normalizedTeamId)
      || !onWorkspaceTeamMembersRequest
    ) {
      return;
    }
    workspaceTeamMemberRequestsRef.current.add(normalizedTeamId);
    void Promise.resolve(onWorkspaceTeamMembersRequest(normalizedTeamId)).catch(() => {
      workspaceTeamMemberRequestsRef.current.delete(normalizedTeamId);
      setWorkspaceTeamMembersById((current) => (
        Object.prototype.hasOwnProperty.call(current, normalizedTeamId)
          ? current
          : { ...current, [normalizedTeamId]: [] }
      ));
    });
  }, [onWorkspaceTeamMembersRequest, workspaceTeamMembersById]);

  useEffect(() => {
    onVersionsSidebarOpenChange?.(versionsOpen);
    return () => onVersionsSidebarOpenChange?.(false);
  }, [onVersionsSidebarOpenChange, versionsOpen]);

  useEffect(() => {
    setDocumentDrafts((current) => {
      const next = createDocumentDrafts(currentDocuments);
      currentDocuments.forEach((document) => {
        const existing = current[document.id];
        if (existing?.revisionId === document.revisionId) {
          next[document.id] = existing;
        }
      });
      return next;
    });
    setActiveDocumentId((current) => {
      if (currentDocuments.some((document) => document.id === current)) return current;
      return currentDocuments.find((document) => document.id === library.homeDocumentId)?.id
        || currentDocuments[0]?.id
        || "";
    });
    setSelectedDocumentIds((current) => new Set(
      [...current].filter((documentId) => (
        documentId !== library.homeDocumentId
        && currentDocuments.some((document) => document.id === documentId)
      )),
    ));
  }, [documentRevisionSignature, library.homeDocumentId, viewedVersionId]);

  useEffect(() => {
    if (
      activeTab === "settings"
      && workspaceTeams.length === 0
      && !workspaceTeamsLoading
      && teamsRequestedForOrganizationRef.current !== activeOrganizationId
    ) {
      teamsRequestedForOrganizationRef.current = activeOrganizationId;
      onWorkspaceTeamsRequest?.();
    }
  }, [activeTab, onWorkspaceTeamsRequest, workspaceTeams.length, workspaceTeamsLoading]);

  const identityDirty = !isHistorical
    && (name.trim() !== library.name || description !== library.description);
  const dirtyDocuments = useMemo(() => currentDocuments.filter((document) => {
    const draft = documentDrafts[document.id];
    return !isHistorical
      && Boolean(draft)
      && (draft.title.trim() !== draft.initialTitle || draft.markdown !== draft.initialMarkdown);
  }), [currentDocuments, documentDrafts, isHistorical]);
  const hasInvalidDocumentTitle = currentDocuments.some((document) => {
    const draft = documentDrafts[document.id];
    return Boolean(draft && !draft.title.trim());
  });
  const dirty = identityDirty || dirtyDocuments.length > 0;

  const versions = useMemo(
    () => [...(library.versions || [])].sort((left, right) => (
      Number(left.versionNumber || left.number || 0) - Number(right.versionNumber || right.number || 0)
    )),
    [library.versions],
  );
  const latestVersion = versions[versions.length - 1] || null;
  const viewedVersion = versions.find((version) => version.id === viewedVersionId)
    || versions.find((version) => version.id === library.currentVersionId)
    || latestVersion;
  const latestVersionNumber = Math.max(
    Number(library.currentVersionNumber || 1),
    ...versions.map((version) => Number(version.versionNumber || version.number || 0)),
  );
  const viewedVersionNumber = Number(
    viewedVersion?.versionNumber || viewedVersion?.number || library.currentVersionNumber || 1,
  );
  const nextVersionNumber = latestVersionNumber + 1;
  const versionSelectorOptions = useMemo(() => [...versions].reverse().map((version) => {
    const number = Number(version.versionNumber || version.number || 1);
    return {
      value: version.id,
      label: `v${number}${number === latestVersionNumber ? " · Latest" : ""}`,
    };
  }), [latestVersionNumber, versions]);

  const openVersionChanges = useCallback(() => {
    const target = versions.find((version) => version.id === viewedVersionId)
      || versions[versions.length - 1]
      || null;
    if (!target) return;
    const targetIndex = versions.findIndex((version) => version.id === target.id);
    const base = targetIndex > 0
      ? versions[targetIndex - 1]
      : versions[targetIndex + 1] || target;
    setVersionChangesState({
      leftVersionId: base.id,
      rightVersionId: target.id,
    });
    setVersionsOpen(true);
  }, [versions, viewedVersionId]);

  useEffect(() => {
    if (!versionChangesState) return undefined;
    let cancelled = false;
    setVersionChangesLoading(true);
    setVersionChangesError("");
    const loadSnapshot = async (versionId: string) => {
      try {
        return (await api.getVersion(library.id, versionId)).documents || [];
      } catch (nextError) {
        if (versionId === library.currentVersionId && library.documents) {
          return library.documents;
        }
        throw nextError;
      }
    };
    void Promise.all([
      loadSnapshot(versionChangesState.leftVersionId),
      loadSnapshot(versionChangesState.rightVersionId),
    ]).then(([left, right]) => {
      if (!cancelled) setVersionChangesDocuments({ left, right });
    }).catch((nextError) => {
      if (!cancelled) {
        setVersionChangesError(
          nextError instanceof Error ? nextError.message : "Failed to compare Knowledge versions.",
        );
      }
    }).finally(() => {
      if (!cancelled) setVersionChangesLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [api, library.currentVersionId, library.documents, library.id, versionChangesState]);

  const leftComparedVersion = versionChangesState
    ? versions.find((version) => version.id === versionChangesState.leftVersionId) || null
    : null;
  const rightComparedVersion = versionChangesState
    ? versions.find((version) => version.id === versionChangesState.rightVersionId) || null
    : null;
  const versionChangesFiles = useMemo(() => buildKnowledgeVersionDiffFiles(
    leftComparedVersion,
    rightComparedVersion,
    versionChangesDocuments.left,
    versionChangesDocuments.right,
  ), [leftComparedVersion, rightComparedVersion, versionChangesDocuments.left, versionChangesDocuments.right]);
  const sharedTeamIds = useMemo(
    () => new Set(getPlatformSharedTeamIds(library.metadata)),
    [library.metadata],
  );
  const ownerCandidateTeamIds = useMemo(
    () => [...sharedTeamIds].filter(Boolean),
    [sharedTeamIds],
  );
  const ownerMissingTeamIds = useMemo(
    () => ownerCandidateTeamIds.filter((teamId) => (
      !Object.prototype.hasOwnProperty.call(workspaceTeamMembersById, teamId)
    )),
    [ownerCandidateTeamIds, workspaceTeamMembersById],
  );
  const teamOwnerCandidates = useMemo(
    () => ownerCandidateTeamIds
      .flatMap((teamId) => workspaceTeamMembersById[teamId] || [])
      .map(normalizeOwnerCandidate)
      .filter((candidate): candidate is KnowledgeOwnerIdentity => Boolean(candidate)),
    [ownerCandidateTeamIds, workspaceTeamMembersById],
  );

  useEffect(() => {
    if (!ownerSelectorOpen || ownerMissingTeamIds.length === 0) return;
    requestWorkspaceTeamMembers(ownerMissingTeamIds[0]);
  }, [ownerMissingTeamIds, ownerSelectorOpen, requestWorkspaceTeamMembers]);

  const shareTeams = useMemo<PlatformResourceShareTeam[]>(
    () => workspaceTeams
      .map(normalizeKnowledgeAccessTeam)
      .filter((team): team is KnowledgeAccessTeam => Boolean(team))
      .filter((team) => ["admin", "owner"].includes(team.roleId))
      .map((team) => ({
        id: team.id,
        name: team.name,
        description: team.description,
        roleLabel: team.roleLabel,
        profileImageUrl: team.profileImageUrl,
        shared: sharedTeamIds.has(team.id),
      })),
    [sharedTeamIds, workspaceTeams],
  );

  const saveChanges = useMemo(() => {
    const changes: Array<{
      id: string;
      label: string;
      content: ReturnType<typeof buildWholeFileDiff>;
    }> = [];
    if (identityDirty) {
      changes.push({
        id: "library-details",
        label: "Library details",
        content: buildWholeFileDiff(
          "library-details.txt",
          `Name: ${library.name}\nDescription: ${library.description}`,
          `Name: ${name.trim()}\nDescription: ${description}`,
        ),
      });
    }
    dirtyDocuments.forEach((document) => {
      const draft = documentDrafts[document.id];
      if (!draft) return;
      const originalPath = `${draft.initialTitle || document.title}.md`;
      const nextPath = `${draft.title.trim() || document.title}.md`;
      changes.push({
        id: document.id,
        label: nextPath,
        content: buildWholeFileDiff(
          originalPath,
          `# ${draft.initialTitle}\n\n${draft.initialMarkdown}`,
          `# ${draft.title.trim()}\n\n${draft.markdown}`,
        ),
      });
    });
    return changes;
  }, [description, dirtyDocuments, documentDrafts, identityDirty, library.description, library.name, name]);

  const openSaveDialog = useCallback((initialMode: "current" | "new" = "new") => {
    if (busy || !dirty || !name.trim() || hasInvalidDocumentTitle || isHistorical) return;
    setSaveError("");
    setSaveInitialMode(initialMode);
    setSaveDialogKey((current) => current + 1);
    setSaveDialogOpen(true);
  }, [busy, dirty, hasInvalidDocumentTitle, isHistorical, name]);

  const save = useCallback(async (details: PlatformVersionSaveDetails) => {
    if (busy || !dirty || !name.trim() || hasInvalidDocumentTitle || isHistorical) {
      throw new Error("There are no valid Knowledge changes to save.");
    }
    setBusy(true);
    setError("");
    setSaveError("");
    try {
      if (identityDirty) {
        onLibraryChange(await api.updateLibrary(library.id, {
          name: name.trim(),
          description,
        }));
      }
      for (const document of dirtyDocuments) {
        const draft = documentDrafts[document.id];
        if (!draft?.title.trim()) continue;
        const result = await api.updateDocument(library.id, document.id, {
          title: draft.title.trim(),
          markdown: draft.markdown,
          baseRevisionId: draft.revisionId,
        });
        onLibraryChange(result.library);
      }
      if (details.mode === "new") {
        onLibraryChange(await api.createVersion(library.id, {
          description: details.description,
        }));
      }
      await onReload();
      setSaveDialogOpen(false);
    } catch (nextError) {
      const normalizedError = nextError instanceof Error
        ? nextError
        : new Error("Failed to save Knowledge changes.");
      setError(normalizedError.message);
      setSaveError(normalizedError.message);
      throw normalizedError;
    } finally {
      setBusy(false);
    }
  }, [api, busy, description, dirty, dirtyDocuments, documentDrafts, hasInvalidDocumentTitle, identityDirty, isHistorical, library.id, name, onLibraryChange, onReload]);

  useEffect(() => {
    const handleSave = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        event.stopPropagation();
        openSaveDialog("new");
      }
    };
    window.addEventListener("keydown", handleSave, true);
    return () => window.removeEventListener("keydown", handleSave, true);
  }, [openSaveDialog]);

  function openShareModal() {
    onWorkspaceTeamsRequest?.();
    setTitleActionsOpen(false);
    setSelectedShareTeamIds([]);
    setShareError("");
    setShareModalOpen(true);
  }

  async function shareWithTeams(teamIds: string[]) {
    if (busy || dirty || isHistorical) return;
    const requestedTeamIds = new Set(
      teamIds.map((teamId) => String(teamId || "").trim()).filter(Boolean),
    );
    const teamsToShare = shareTeams.filter((team) => (
      requestedTeamIds.has(team.id) && !team.shared && !team.disabled
    ));
    if (teamsToShare.length === 0) {
      setShareError("Choose at least one team first.");
      return;
    }
    setBusy(true);
    setShareError("");
    const createdShares: Array<{ teamId: string; shareId: string }> = [];
    try {
      const metadata = asRecord(library.metadata);
      let nextMetadata = { ...metadata };
      for (const team of teamsToShare) {
        nextMetadata = buildPlatformTeamAccessMetadata(
          nextMetadata,
          team.id,
          true,
          "knowledge_library_team_role",
        );
      }
      const teamRolePermissionSets = asRecord(nextMetadata.teamRolePermissionSets);
      for (const team of teamsToShare) {
        const share = await api.addTeamShare(team.id, library.id, {
          permissionSets: asRecord(teamRolePermissionSets[team.id]),
        });
        const shareId = String(share.id || "").trim();
        if (!shareId) throw new Error(`The team share for ${team.name} did not return an ID.`);
        createdShares.push({ teamId: team.id, shareId });
      }
      const nextShareIds = { ...asRecord(metadata.teamAccessShareIds) };
      createdShares.forEach(({ teamId, shareId }) => {
        nextShareIds[teamId] = shareId;
      });
      onLibraryChange(await api.updateLibrary(library.id, {
        metadata: {
          ...nextMetadata,
          teamAccessShareIds: nextShareIds,
        },
      }));
      setSelectedShareTeamIds([]);
      setShareModalOpen(false);
    } catch (nextError) {
      await Promise.all(createdShares.map(({ teamId, shareId }) => (
        api.removeTeamShare(teamId, shareId).catch(() => undefined)
      )));
      setShareError(
        nextError instanceof Error
          ? nextError.message
          : "Failed to share the Knowledge library with the selected teams.",
      );
    } finally {
      setBusy(false);
    }
  }

  function openRenameModal() {
    setTitleActionsOpen(false);
    setRenameError("");
    setRenameModalOpen(true);
  }

  async function renameLibrary(nextName: string) {
    const normalizedName = nextName.trim();
    if (!normalizedName || normalizedName === library.name || busy || dirty || isHistorical) return;
    setBusy(true);
    setRenameError("");
    try {
      onLibraryChange(await api.updateLibrary(library.id, { name: normalizedName }));
      setName(normalizedName);
      setRenameModalOpen(false);
    } catch (nextError) {
      setRenameError(
        nextError instanceof Error ? nextError.message : "Failed to rename the Knowledge library.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyLibraryId() {
    setTitleActionsOpen(false);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard access is unavailable.");
      await navigator.clipboard.writeText(library.id);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to copy the Knowledge ID.");
    }
  }

  const workspaceFiles = useMemo<PlatformCodeEditorFile[]>(() => currentDocuments.map((document) => {
    const draft = documentDrafts[document.id];
    const title = draft?.title || document.title;
    return {
      id: document.id,
      label: title,
      tabLabel: title,
      editorMode: "markdown",
      dirty: Boolean(
        draft
        && (draft.title.trim() !== draft.initialTitle || draft.markdown !== draft.initialMarkdown)
      ),
      ariaLabel: title,
      searchText: `${title} ${document.summary}`,
      selectable: !isHistorical,
      renameDisabled: isHistorical,
      deleteDisabled: isHistorical || dirty || document.id === library.homeDocumentId,
      moveDisabled: true,
    };
  }), [currentDocuments, dirty, documentDrafts, isHistorical, library.homeDocumentId]);
  const activeDocument = currentDocuments.find((document) => document.id === activeDocumentId) || null;
  const activeDocumentDraft = activeDocument ? documentDrafts[activeDocument.id] : null;
  const selectableDocumentIds = currentDocuments
    .filter((document) => document.id !== library.homeDocumentId)
    .map((document) => document.id);
  const allDocumentsSelected = selectableDocumentIds.length > 0
    && selectableDocumentIds.every((documentId) => selectedDocumentIds.has(documentId));
  const someDocumentsSelected = !allDocumentsSelected
    && selectableDocumentIds.some((documentId) => selectedDocumentIds.has(documentId));

  const updateActiveDocumentDraft = useCallback((update: Partial<Pick<KnowledgeDocumentDraft, "title" | "markdown">>) => {
    if (!activeDocument || isHistorical) return;
    setDocumentDrafts((current) => {
      const draft = current[activeDocument.id];
      if (!draft) return current;
      return {
        ...current,
        [activeDocument.id]: { ...draft, ...update },
      };
    });
  }, [activeDocument, isHistorical]);

  const createDocument = useCallback(async () => {
    if (busy || isHistorical) return;
    const existingTitles = new Set(currentDocuments.map((document) => (
      documentDrafts[document.id]?.title || document.title
    ).trim().toLowerCase()));
    let title = "Untitled document";
    let suffix = 2;
    while (existingTitles.has(title.toLowerCase())) {
      title = `Untitled document ${suffix}`;
      suffix += 1;
    }
    setBusy(true);
    setError("");
    try {
      const result = await api.createDocument(library.id, {
        title,
        markdown: "",
        sortOrder: currentDocuments.length,
      });
      const documents = [
        ...(result.library.documents || library.documents || [])
          .filter((document) => document.id !== result.document.id),
        result.document,
      ];
      onLibraryChange({
        ...library,
        ...result.library,
        documents,
        versions: result.library.versions || library.versions,
      });
      setActiveDocumentId(result.document.id);
      return result.document.id;
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to create the document.");
    } finally {
      setBusy(false);
    }
  }, [api, busy, currentDocuments, documentDrafts, isHistorical, library, onLibraryChange]);

  const requestDocumentRename = useCallback((file: PlatformCodeEditorFile, nextTitle: string) => {
    if (isHistorical) return;
    setActiveDocumentId(file.id);
    setDocumentDrafts((current) => {
      const draft = current[file.id];
      if (!draft) return current;
      return {
        ...current,
        [file.id]: {
          ...draft,
          title: nextTitle,
        },
      };
    });
  }, [isHistorical]);

  const requestDocumentArchive = useCallback((files: readonly PlatformCodeEditorFile[]) => {
    if (isHistorical) return;
    const targets = files
      .map((file) => currentDocuments.find((document) => document.id === file.id))
      .filter((document): document is KnowledgeDocument => (
        Boolean(document) && document?.id !== library.homeDocumentId
      ));
    if (targets.length > 0) setArchiveDocuments(targets);
  }, [currentDocuments, dirty, isHistorical, library.homeDocumentId]);

  const sectionSwitch = (
    <PlatformSwitch
      value={activeTab}
      options={[
        { value: "general", label: "General" },
        { value: "settings", label: "Settings" },
      ]}
      onValueChange={(value) => setActiveTab(value === "settings" ? "settings" : "general")}
      ariaLabel="Knowledge library section"
    />
  );
  const titleActions = (
    <PlatformResourceHeaderActions>
      <PlatformResourceVersionLabel
        resourceLabel="Knowledge library"
        version={viewedVersionNumber}
        latestVersion={latestVersionNumber}
        disabled={busy}
        onOpenVersionHistory={() => {
          setTitleActionsOpen(false);
          setVersionsOpen(true);
        }}
      />
      <PlatformResourceActionsMenu
        open={titleActionsOpen}
        onOpenChange={setTitleActionsOpen}
        resourceLabel="Knowledge Library"
        disabled={busy}
        shortcutActions={{
          share: {
            onInvoke: openShareModal,
            disabled: dirty || isHistorical || shareModalOpen || renameModalOpen || deleteConfirmationOpen,
          },
          rename: {
            onInvoke: openRenameModal,
            disabled: dirty || isHistorical || shareModalOpen || renameModalOpen || deleteConfirmationOpen,
          },
          delete: {
            onInvoke: () => setDeleteConfirmationOpen(true),
            disabled: shareModalOpen || renameModalOpen || deleteConfirmationOpen,
          },
        }}
      >
        <PlatformResourceActionsInformation
          resourceLabel="Knowledge Library"
          items={[
            {
              id: "id",
              label: "ID",
              value: library.id,
              title: library.id,
              monospace: true,
              copyValue: library.id,
              copyAriaLabel: "Copy Knowledge Library ID",
            },
            { id: "created", label: "Created", value: formatTimestamp(library.createdAt) },
            { id: "updated", label: "Updated", value: formatTimestamp(library.updatedAt) },
          ]}
        />
        <PlatformResourceVersionHistoryMenuItem
          onClick={() => {
            setTitleActionsOpen(false);
            setVersionsOpen(true);
          }}
        />
        <PlatformResourceActionsDivider />
        <PlatformResourceActionMenuItem
          icon={<UsersRound width={14} height={14} strokeWidth={1.8} aria-hidden="true" />}
          label="Share"
          shortcut="share"
          disabled={dirty || isHistorical}
          title={dirty
            ? "Save Knowledge changes before sharing."
            : isHistorical
              ? "Return to the current version before sharing."
              : undefined}
          onClick={openShareModal}
        />
        <PlatformResourceActionMenuItem
          icon={<Copy width={14} height={14} strokeWidth={1.8} aria-hidden="true" />}
          label="Copy Knowledge Library ID"
          onClick={() => void copyLibraryId()}
        />
        <PlatformResourceActionsDivider />
        <PlatformResourceActionMenuItem
          icon={<SquarePen width={14} height={14} strokeWidth={1.8} aria-hidden="true" />}
          label="Rename"
          shortcut="rename"
          disabled={dirty || isHistorical}
          title={dirty
            ? "Save Knowledge changes before renaming."
            : isHistorical
              ? "Return to the current version before renaming."
              : undefined}
          onClick={openRenameModal}
        />
        <PlatformResourceActionMenuItem
          icon={<Trash2 width={14} height={14} strokeWidth={1.8} aria-hidden="true" />}
          label="Delete"
          shortcut="delete"
          onClick={() => {
            setTitleActionsOpen(false);
            setDeleteConfirmationOpen(true);
          }}
        />
      </PlatformResourceActionsMenu>
    </PlatformResourceHeaderActions>
  );
  const saveAction = (
    <PlatformPrimaryButton
      size="small"
      disabled={busy || !dirty || !name.trim() || hasInvalidDocumentTitle || isHistorical}
      onClick={() => openSaveDialog("new")}
    >
      <Bookmark width={14} height={14} aria-hidden="true" />
      {busy ? "Saving…" : "Save Changes"}
    </PlatformPrimaryButton>
  );
  const ownerIdentity: KnowledgeOwnerIdentity = {
    id: library.ownerId || library.ownerUserId,
    name: library.ownerName || library.ownerEmail || "Unknown user",
    email: library.ownerEmail || "",
    avatarUrl: library.ownerAvatarUrl || "",
  };
  const ownerOptions = useMemo<PlatformOwnerOption<string, { identity: KnowledgeOwnerIdentity }>[]>(() => {
    const byId = new Map<string, KnowledgeOwnerIdentity>();
    [ownerIdentity, ...ownerCandidates, ...teamOwnerCandidates].forEach((candidate) => {
      const key = String(candidate.id || candidate.email || "").trim();
      if (key && !byId.has(key)) byId.set(key, candidate);
    });
    return [...byId.values()].map((candidate) => ({
      value: candidate.id,
      name: candidate.name,
      email: candidate.email,
      avatarUrl: candidate.avatarUrl,
      data: { identity: candidate },
    }));
  }, [ownerCandidates, ownerIdentity.avatarUrl, ownerIdentity.email, ownerIdentity.id, ownerIdentity.name, teamOwnerCandidates]);

  const openOwnerSelector = useCallback(async (open: boolean) => {
    if (!open) {
      setOwnerSelectorOpen(false);
      return;
    }
    if (busy || dirty || !activeOrganizationId) return;
    setOwnerSelectorOpen(true);
    if (ownerCandidates.length > 0 || ownerCandidatesLoading) return;
    setOwnerCandidatesLoading(true);
    try {
      setOwnerCandidates(
        (await api.listOrganizationMembers(activeOrganizationId))
          .map(normalizeOwnerCandidate)
          .filter((candidate): candidate is KnowledgeOwnerIdentity => Boolean(candidate)),
      );
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load organization members.");
    } finally {
      setOwnerCandidatesLoading(false);
    }
  }, [activeOrganizationId, api, busy, dirty, ownerCandidates.length, ownerCandidatesLoading]);

  const transferOwner = useCallback(async (
    _value: string,
    option: PlatformOwnerOption<string, { identity: KnowledgeOwnerIdentity }>,
  ) => {
    const nextOwner = option.data?.identity;
    if (!nextOwner || busy || dirty) return;
    setBusy(true);
    setError("");
    try {
      onLibraryChange(await api.updateLibrary(library.id, {
        metadata: {
          ...library.metadata,
          owner: {
            id: nextOwner.id,
            userId: nextOwner.id,
            name: nextOwner.name,
            email: nextOwner.email,
            avatarUrl: nextOwner.avatarUrl,
          },
          ownerId: nextOwner.id,
          ownerUserId: nextOwner.id,
          ownerName: nextOwner.name,
          ownerEmail: nextOwner.email,
          ownerAvatarUrl: nextOwner.avatarUrl,
        },
        permissionSet: library.permissionSet,
      }));
      setOwnerSelectorOpen(false);
    } catch (nextError) {
      const normalized = nextError instanceof Error ? nextError : new Error("Failed to transfer ownership.");
      setError(normalized.message);
      throw normalized;
    } finally {
      setBusy(false);
    }
  }, [api, busy, dirty, library.id, library.metadata, library.permissionSet, onLibraryChange]);

  const sidebar = (
    <PlatformResourceDetailSidebar
      attributes={[
        { id: "updated", label: "Updated", value: formatTimestamp(library.updatedAt) },
      ]}
      creator={{
        value: library.creatorId,
        name: library.creatorName,
        email: library.creatorEmail,
        avatarUrl: library.creatorAvatarUrl,
      }}
      owner={{
        value: ownerIdentity.id,
        name: ownerIdentity.name,
        email: ownerIdentity.email,
        avatarUrl: ownerIdentity.avatarUrl,
      }}
      ownerOptions={ownerOptions}
      onOwnerTransfer={transferOwner}
      ownerSelectorProps={{
        open: ownerSelectorOpen,
        onOpenChange: (open) => void openOwnerSelector(open),
        ariaLabel: "Choose Knowledge library owner",
        resourceLabel: "Knowledge library",
        alignment: "end",
        popupAlignment: "right",
        fullWidth: true,
        disabled: busy || dirty || !activeOrganizationId,
        loading: ownerCandidatesLoading || (ownerSelectorOpen && ownerMissingTeamIds.length > 0),
        title: dirty ? "Save Knowledge changes before changing the owner." : undefined,
      }}
      primaryAction={onStartThread ? (
        <PlatformPrimaryButton
          className="knowledge-detail-page__start-thread-button"
          fullWidth
          size="small"
          onClick={() => onStartThread(library)}
        >
          <Send width={14} height={14} aria-hidden="true" />
          Start Thread
        </PlatformPrimaryButton>
      ) : null}
      className="knowledge-detail-page__settings-sidebar"
      propertiesClassName="knowledge-detail-page__settings-sidebar-properties"
    />
  );

  const identitySection = (
    <section className="skill-detail-page__identity knowledge-library-identity" aria-label="Knowledge library identity">
      <span className="knowledge-library-identity__icon" aria-hidden="true">
        <LibraryBig width={24} height={24} strokeWidth={1.7} />
      </span>
      <div className="skill-detail-page__identity-copy">
        <input
          className="skill-detail-page__name-input"
          value={name}
          readOnly={isHistorical}
          placeholder="Knowledge library"
          aria-label="Knowledge library name"
          onChange={(event) => setName(event.currentTarget.value)}
        />
        <input
          className="file-resource-detail-page__description-input skill-detail-page__description-input"
          value={description}
          readOnly={isHistorical}
          placeholder="Describe what people and agents can learn here"
          aria-label="Knowledge library description"
          onChange={(event) => setDescription(event.currentTarget.value)}
        />
      </div>
      {isHistorical ? <PlatformLabel variant="gray">Version preview</PlatformLabel> : null}
    </section>
  );

  const documentWorkspace = (
    <PlatformCodeEditorWorkspace
      className="knowledge-detail-page__document-workspace"
      ariaLabel={`${library.name} document editor`}
      variant="full-screen"
      sidebarTitle={(
        <span className="knowledge-document-workspace__sidebar-heading">
          <PlatformCheckbox
            className="knowledge-document-workspace__select-all"
            checked={allDocumentsSelected}
            indeterminate={someDocumentsSelected}
            disabled={isHistorical || selectableDocumentIds.length === 0}
            aria-label={allDocumentsSelected ? "Deselect all documents" : "Select all documents"}
            onClick={() => setSelectedDocumentIds(
              allDocumentsSelected ? new Set() : new Set(selectableDocumentIds),
            )}
          />
          <span>Documents</span>
        </span>
      )}
      files={workspaceFiles}
      activeFileId={activeDocumentId}
      onFileSelect={setActiveDocumentId}
      selectedFileIds={selectedDocumentIds}
      onFileSelectionChange={({ selectedIds }) => setSelectedDocumentIds(new Set(
        [...selectedIds].filter((documentId) => documentId !== library.homeDocumentId),
      ))}
      onFileRename={isHistorical ? undefined : requestDocumentRename}
      onFilesDelete={isHistorical ? undefined : requestDocumentArchive}
      onCreateFile={isHistorical ? undefined : createDocument}
      createFileLabel="Create Document"
      createFileButtonLabel="Add document"
      fileCreationDisabled={busy || isHistorical}
      emptyFiles="No Knowledge documents yet."
      emptyEditor="Select a document to start editing."
      markdownEditor={activeDocument && activeDocumentDraft ? {
        value: activeDocumentDraft.markdown,
        onChange: (markdown) => updateActiveDocumentDraft({ markdown }),
        title: (
          <input
            className="knowledge-document-workspace__title-input"
            value={activeDocumentDraft.title}
            readOnly={isHistorical}
            aria-label="Knowledge document title"
            placeholder="Untitled document"
            onChange={(event) => updateActiveDocumentDraft({ title: event.currentTarget.value })}
          />
        ),
        placeholder: "Write durable knowledge for people and agents.",
        ariaLabel: `${activeDocumentDraft.title || "Knowledge document"} content`,
        readOnly: isHistorical,
        historyKey: `${activeDocument.id}:${activeDocumentDraft.revisionId}`,
        contentVariant: "file-enabled",
        fileUpload: {
          upload: (files) => api.uploadEditorAttachments(files),
          resolvePreviewSource: (file, signal) => api.resolveEditorAttachmentPreview(file, signal),
          accept: "*/*",
          disabled: busy || isHistorical,
        },
        className: "knowledge-document-workspace__editor",
      } : undefined}
    />
  );

  const settings = (
    <div className="playground-server-detail-content knowledge-detail-page__settings-content">
      <div
        className={`playground-server-settings-tab is-function-settings-tab knowledge-settings-layout${accessDetailOpen ? " is-access-detail-view" : ""}`}
      >
        {!accessDetailOpen ? (
          <PlatformDeploymentMap
            key="knowledge-storage-map"
            className="knowledge-detail-page__storage-map"
            regionCode={String(library.metadata.region || library.metadata.location || "eur3")}
            title="Location"
          />
        ) : null}
        <KnowledgeAccessSettings
          key="knowledge-access-settings"
          library={library}
          api={api}
          workspaceTeams={workspaceTeams}
          workspaceTeamMembersById={workspaceTeamMembersById}
          onWorkspaceTeamMembersRequest={requestWorkspaceTeamMembers}
          onLibraryChange={onLibraryChange}
          onPermissionDetailOpenChange={setAccessDetailOpen}
        />
      </div>
    </div>
  );
  const saveActionPortal = controlsPortal || (!titleActionsPortalId ? actionsPortal : null);
  const detailSurface = versionChangesState ? (
    <div className="knowledge-version-changes-surface">
      {versionChangesLoading ? (
        <PlatformLoadingState centered message="Loading version changes…" />
      ) : versionChangesError ? (
        <div className="knowledge-version-changes-surface__error" role="alert">
          {versionChangesError}
        </div>
      ) : (
        <PlatformVersionChangesPage
          title="Changes"
          subtitle="Compare saved Knowledge versions and review the exact document changes."
          files={versionChangesFiles}
          leftSelector={{
            value: versionChangesState.leftVersionId,
            options: versionSelectorOptions,
            onValueChange: (value) => setVersionChangesState((current) => current ? {
              ...current,
              leftVersionId: value,
            } : current),
            ariaLabel: "Select base Knowledge version",
          }}
          rightSelector={{
            value: versionChangesState.rightVersionId,
            options: versionSelectorOptions,
            onValueChange: (value) => setVersionChangesState((current) => current ? {
              ...current,
              rightVersionId: value,
            } : current),
            ariaLabel: "Select target Knowledge version",
          }}
          onBack={() => setVersionChangesState(null)}
          backLabel="Back to Knowledge library"
          emptyMessage="No differences between the selected versions."
          className="knowledge-version-changes-page"
        />
      )}
    </div>
  ) : (
    <MarkdownResourceDetailPage
      activeTab={activeTab === "settings" ? "settings" : "code"}
      metadata={identitySection}
      notice={error ? <p className="knowledge-inline-error" role="alert">{error}</p> : null}
      code={documentWorkspace}
      settings={settings}
      sidebar={accessDetailOpen ? null : sidebar}
      sidebarCollapsed={activeTab !== "settings" || versionsOpen}
      ariaLabel={`${library.name} Knowledge library`}
      sidebarAriaLabel="Knowledge library information"
      className={`knowledge-detail-page playground-project-overview-layout playground-agents-detail-overview-layout is-${activeTab}-tab${accessDetailOpen ? " is-access-detail-view" : ""}`}
      contentClassName={`knowledge-detail-content playground-project-overview-main playground-agents-detail-overview-main is-${activeTab}-tab`}
      codeClassName="knowledge-detail-page__general"
      metadataClassName="knowledge-detail-page__identity"
      noticeClassName="knowledge-detail-page__notice"
      workspaceClassName="knowledge-detail-page__workspace"
      settingsClassName="knowledge-detail-page__settings"
      sidebarClassName="knowledge-detail-sidebar playground-project-overview-sidebar playground-agents-detail-sidebar playground-ticket-detail-sidebar"
    />
  );

  return (
    <>
      {sectionPortal ? createPortal(sectionSwitch, sectionPortal) : null}
      {actionsPortal ? createPortal(titleActions, actionsPortal) : null}
      {saveActionPortal ? createPortal(saveAction, saveActionPortal) : null}
      {detailSurface}
      <PlatformVersionSaveDialog
        open={saveDialogOpen}
        title="Review changes"
        currentVersion={library.currentVersionNumber || viewedVersionNumber}
        nextVersion={nextVersionNumber}
        currentDescription={viewedVersion?.description || ""}
        initialMode={saveInitialMode}
        canSaveCurrent={Boolean(library.currentVersionId)}
        instanceKey={saveDialogKey}
        pending={busy}
        error={saveError || null}
        changes={saveChanges.map((change) => ({
          id: change.id,
          label: change.label,
          content: (
            <PlatformDiffViewer
              filePath={change.content.filePath}
              diffContent={change.content.diffContent}
              fileContent={change.content.fileContent}
              additions={change.content.additions}
              deletions={change.content.deletions}
              hideTopbar
              embedded
              defaultExpanded
              maxHeight={330}
            />
          ),
        }))}
        emptyChanges="No Knowledge changes were found."
        onClose={() => {
          if (!busy) setSaveDialogOpen(false);
        }}
        onSubmit={save}
      />
      <PlatformResourceShareModal
        open={shareModalOpen}
        resourceLabel="Knowledge Library"
        resourceName={library.name}
        teams={shareTeams}
        loading={workspaceTeamsLoading}
        selectionMode="multiple"
        selectedTeamIds={selectedShareTeamIds}
        onSelectedTeamIdsChange={setSelectedShareTeamIds}
        onClose={() => {
          if (!busy) setShareModalOpen(false);
        }}
        onShareTeams={shareWithTeams}
        busy={busy}
        error={shareError}
        emptyMessage="No teams you can manage are available."
      />
      <PlatformResourceRenameModal
        open={renameModalOpen}
        resourceLabel="Knowledge Library"
        initialName={library.name}
        onClose={() => {
          if (!busy) setRenameModalOpen(false);
        }}
        onRename={renameLibrary}
        busy={busy}
        error={renameError}
      />
      <PlatformConfirmationModal
        open={deleteConfirmationOpen}
        title="Delete Knowledge Library?"
        description={`This permanently deletes ${library.name}, its documents, versions, and access configuration.`}
        confirmLabel="Delete Library"
        confirmingLabel="Deleting…"
        tone="destructive"
        onCancel={() => {
          if (!busy) setDeleteConfirmationOpen(false);
        }}
        onConfirm={async () => {
          if (busy) return;
          setBusy(true);
          setError("");
          try {
            await api.deleteLibrary(library.id);
            setDeleteConfirmationOpen(false);
            onLibraryDeleted?.(library.id);
          } catch (nextError) {
            setError(nextError instanceof Error
              ? nextError.message
              : "Failed to delete the Knowledge library.");
          } finally {
            setBusy(false);
          }
        }}
      />
      <PlatformConfirmationModal
        open={archiveDocuments.length > 0}
        title={archiveDocuments.length > 1 ? "Archive documents?" : "Archive document?"}
        description={archiveDocuments.length > 1
          ? `${archiveDocuments.length} documents will be removed from the current draft. Published versions remain immutable.`
          : archiveDocuments[0]
            ? `“${archiveDocuments[0].title}” will be removed from the current draft. Published versions remain immutable.`
            : ""}
        confirmLabel={archiveDocuments.length > 1 ? "Archive Documents" : "Archive"}
        tone="destructive"
        onCancel={() => !busy && setArchiveDocuments([])}
        onConfirm={async () => {
          if (archiveDocuments.length === 0 || busy) return;
          setBusy(true);
          setError("");
          try {
            for (const document of archiveDocuments) {
              await api.archiveDocument(library.id, document.id);
            }
            setArchiveDocuments([]);
            await onReload();
          } catch (nextError) {
            setError(nextError instanceof Error ? nextError.message : "Failed to archive the Knowledge document.");
          } finally {
            setBusy(false);
          }
        }}
      />
      {(!versionsDrawerPortalId || versionsPortal) ? (
        <PlatformVersionHistorySidebar<KnowledgeLibraryVersion>
          open={versionsOpen}
          title="Version history"
          sectionTitle="All Versions"
          className="knowledge-version-history-sidebar"
          width="var(--playground-thread-task-detail-width)"
          portal={Boolean(versionsPortal)}
          portalTarget={versionsPortal}
          versions={versions}
          activeVersionId={library.publishedVersionId}
          selectedVersionId={viewedVersionId}
          busy={busy || dirty}
          onClose={() => {
            setVersionChangesState(null);
            setVersionsOpen(false);
          }}
          onCreateVersion={async () => {
            setBusy(true);
            try {
              onLibraryChange(await api.createVersion(library.id));
              await onReload();
            } finally {
              setBusy(false);
            }
          }}
          onSelectVersion={async (versionId) => {
            setVersionChangesState(null);
            if (versionId === library.currentVersionId) {
              setViewedVersionId(versionId);
              setViewedDocuments(null);
              return;
            }
            const snapshot = await api.getVersion(library.id, versionId);
            setViewedVersionId(versionId);
            setViewedDocuments(snapshot.documents);
            setActiveTab("general");
          }}
          onViewChanges={openVersionChanges}
          onPublishVersion={async (versionId) => {
            setBusy(true);
            try {
              onLibraryChange(await api.publishVersion(library.id, versionId));
              await onReload();
            } finally {
              setBusy(false);
            }
          }}
          canPublishVersion={(version) => version.id !== library.publishedVersionId}
          getVersionCreatedAt={(version) => formatTimestamp(version.createdAt || version.updatedAt)}
          emptyDescription="Create a version to retain a stable Knowledge snapshot."
        />
      ) : null}
    </>
  );
}

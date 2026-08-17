import {
  Bookmark,
  BookOpenText,
  ChevronRight,
  FilePlus2,
  LibraryBig,
  Send,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  PlatformDataTable,
  type PlatformDataTableAction,
  type PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformDeploymentMap } from "../../../../../platform-ui/components/composite/deployment-map/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformInstructionsEditor } from "../../../../../platform-ui/components/composite/instructions-editor/index.js";
import { PlatformModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import type { PlatformOwnerOption } from "../../../../../platform-ui/components/composite/owner-selector/index.js";
import { PlatformResourceDetailSidebar } from "../../../../../platform-ui/components/composite/resource-detail-sidebar/index.js";
import { PlatformVersionHistorySidebar } from "../../../../../platform-ui/components/composite/versioning/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformLabel } from "../../../../../platform-ui/components/ui/label/index.js";
import { PlatformSwitch } from "../../../../../platform-ui/components/ui/switch/index.js";
import { PlatformServiceDetailPage } from "../../../../../platform-ui/pages/details/index.js";
import type { KnowledgeApi } from "../api/index.js";
import type {
  KnowledgeDocument,
  KnowledgeLibrary,
  KnowledgeLibraryVersion,
} from "../domain/index.js";
import { KnowledgeAccessSettings } from "./knowledge-access-settings.js";

type KnowledgeDetailTab = "general" | "settings";

export interface KnowledgeLibraryDetailPageProps {
  library: KnowledgeLibrary;
  api: KnowledgeApi;
  sectionControlsPortalId?: string;
  titleActionsPortalId?: string;
  versionsDrawerPortalId?: string;
  workspaceTeams?: readonly unknown[];
  workspaceTeamsLoading?: boolean;
  activeOrganizationId?: string;
  onWorkspaceTeamsRequest?: () => void;
  onLibraryChange: (library: KnowledgeLibrary) => void;
  onReload: () => Promise<void>;
  onOpenDocument: (document: KnowledgeDocument) => void;
  onRequestArchiveDocument: (document: KnowledgeDocument) => void;
  onStartThread?: (library: KnowledgeLibrary) => void;
}

function usePortalTarget(id?: string) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setTarget(id && typeof document !== "undefined" ? document.getElementById(id) : null);
  }, [id]);
  return target;
}

function formatTimestamp(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));
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
  const nested = [source.user, source.profile, source.account, source.member]
    .map(asRecord)
    .find((candidate) => Object.keys(candidate).length > 0) || {};
  const read = (...keys: string[]) => {
    for (const key of keys) {
      const direct = String(source[key] || "").trim();
      if (direct) return direct;
      const nestedValue = String(nested[key] || "").trim();
      if (nestedValue) return nestedValue;
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
  sectionControlsPortalId,
  titleActionsPortalId,
  versionsDrawerPortalId,
  workspaceTeams = [],
  workspaceTeamsLoading = false,
  activeOrganizationId = "",
  onWorkspaceTeamsRequest,
  onLibraryChange,
  onReload,
  onOpenDocument,
  onRequestArchiveDocument,
  onStartThread,
}: KnowledgeLibraryDetailPageProps) {
  const sectionPortal = usePortalTarget(sectionControlsPortalId);
  const actionsPortal = usePortalTarget(titleActionsPortalId);
  const versionsPortal = usePortalTarget(versionsDrawerPortalId);
  const [activeTab, setActiveTab] = useState<KnowledgeDetailTab>("general");
  const [name, setName] = useState(library.name);
  const [description, setDescription] = useState(library.description);
  const [homeMarkdown, setHomeMarkdown] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [createDocumentOpen, setCreateDocumentOpen] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [viewedVersionId, setViewedVersionId] = useState(library.currentVersionId);
  const [viewedDocuments, setViewedDocuments] = useState<KnowledgeDocument[] | null>(null);
  const [accessDetailOpen, setAccessDetailOpen] = useState(false);
  const [ownerSelectorOpen, setOwnerSelectorOpen] = useState(false);
  const [ownerCandidatesLoading, setOwnerCandidatesLoading] = useState(false);
  const [ownerCandidates, setOwnerCandidates] = useState<KnowledgeOwnerIdentity[]>([]);
  const teamsRequestedForOrganizationRef = useRef("");
  const documents = (viewedDocuments || library.documents || []).filter((document) => !document.archived);
  const homeDocument = documents.find((document) => document.id === library.homeDocumentId) || null;
  const isHistorical = viewedVersionId !== library.currentVersionId;

  useEffect(() => {
    setName(library.name);
    setDescription(library.description);
    setViewedVersionId(library.currentVersionId);
    setViewedDocuments(null);
    setOwnerSelectorOpen(false);
    setOwnerCandidates([]);
  }, [library.id, library.name, library.description, library.currentVersionId]);

  useEffect(() => {
    setHomeMarkdown(homeDocument?.markdown || "");
  }, [homeDocument?.id, homeDocument?.revisionId]);

  useEffect(() => {
    const openVersions = () => setVersionsOpen(true);
    window.addEventListener("knowledge:open-versions", openVersions);
    return () => window.removeEventListener("knowledge:open-versions", openVersions);
  }, []);

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

  const identityDirty = name.trim() !== library.name || description !== library.description;
  const homeDirty = !isHistorical && homeDocument !== null && homeMarkdown !== homeDocument.markdown;
  const dirty = identityDirty || homeDirty;

  const save = useCallback(async () => {
    if (busy || !dirty || !name.trim() || isHistorical) return;
    setBusy(true);
    setError("");
    try {
      if (identityDirty) {
        onLibraryChange(await api.updateLibrary(library.id, {
          name: name.trim(),
          description,
        }));
      }
      if (homeDirty && homeDocument) {
        const result = await api.updateDocument(library.id, homeDocument.id, {
          markdown: homeMarkdown,
          baseRevisionId: homeDocument.revisionId,
        });
        onLibraryChange(result.library);
      }
      await onReload();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to save Knowledge changes.");
    } finally {
      setBusy(false);
    }
  }, [api, busy, description, dirty, homeDirty, homeDocument, homeMarkdown, identityDirty, isHistorical, library.id, name, onLibraryChange, onReload]);

  useEffect(() => {
    const handleSave = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", handleSave);
    return () => window.removeEventListener("keydown", handleSave);
  }, [save]);

  const documentColumns = useMemo<PlatformDataTableColumn<KnowledgeDocument>[]>(() => [
    {
      id: "title",
      header: "Document",
      accessor: "title",
      sortable: true,
      width: "minmax(320px, 1.5fr)",
      cell: ({ row }) => (
        <span className="knowledge-document-identity">
          <BookOpenText width={16} height={16} strokeWidth={1.8} aria-hidden="true" />
          <span>
            <span className="knowledge-document-identity__title">{row.title}</span>
            {row.summary ? <span className="knowledge-document-identity__summary">{row.summary}</span> : null}
          </span>
        </span>
      ),
    },
    {
      id: "updated",
      header: "Updated",
      accessor: "updatedAt",
      sortable: true,
      sortDescFirst: true,
      width: "minmax(160px, 0.55fr)",
      cell: ({ row }) => <span className="knowledge-table-value">{formatTimestamp(row.updatedAt)}</span>,
    },
  ], []);

  async function createDocument(event: FormEvent) {
    event.preventDefault();
    const title = documentTitle.trim();
    if (!title || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await api.createDocument(library.id, {
        title,
        markdown: `# ${title}\n\n`,
        sortOrder: documents.length,
      });
      setCreateDocumentOpen(false);
      setDocumentTitle("");
      onLibraryChange(result.library);
      await onReload();
      onOpenDocument(result.document);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to create the document.");
    } finally {
      setBusy(false);
    }
  }

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
  const headerActions = (
    <div className="knowledge-header-actions">
      <PlatformSecondaryButton size="small" onClick={() => setVersionsOpen(true)}>
        v{library.currentVersionNumber}
      </PlatformSecondaryButton>
      <PlatformPrimaryButton
        size="small"
        disabled={busy || !dirty || !name.trim() || isHistorical}
        onClick={() => void save()}
      >
        <Bookmark width={14} height={14} aria-hidden="true" />
        {busy ? "Saving…" : "Save Changes"}
      </PlatformPrimaryButton>
    </div>
  );
  const ownerIdentity: KnowledgeOwnerIdentity = {
    id: library.ownerId || library.ownerUserId,
    name: library.ownerName || library.ownerEmail || "Unknown user",
    email: library.ownerEmail || "",
    avatarUrl: library.ownerAvatarUrl || "",
  };
  const ownerOptions = useMemo<PlatformOwnerOption<string, { identity: KnowledgeOwnerIdentity }>[]>(() => {
    const byId = new Map<string, KnowledgeOwnerIdentity>();
    [ownerIdentity, ...ownerCandidates].forEach((candidate) => {
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
  }, [ownerCandidates, ownerIdentity.avatarUrl, ownerIdentity.email, ownerIdentity.id, ownerIdentity.name]);

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
        { id: "status", label: "Status", value: <PlatformLabel variant={library.publishedVersionId ? "green" : "gray"}>{library.publishedVersionId ? "Published" : "Draft"}</PlatformLabel> },
        { id: "region", label: "Region", value: String(library.metadata.region || library.metadata.location || "eur3") },
        { id: "created", label: "Created", value: formatTimestamp(library.createdAt) },
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
        loading: ownerCandidatesLoading,
        title: dirty ? "Save Knowledge changes before changing the owner." : undefined,
      }}
      primaryAction={onStartThread ? (
        <PlatformPrimaryButton fullWidth size="medium" onClick={() => onStartThread(library)}>
          <Send width={14} height={14} aria-hidden="true" />
          Start Thread
        </PlatformPrimaryButton>
      ) : null}
    />
  );

  return (
    <>
      {sectionPortal ? createPortal(sectionSwitch, sectionPortal) : null}
      {actionsPortal ? createPortal(headerActions, actionsPortal) : null}
      <PlatformServiceDetailPage
        sidebarContent={sidebar}
        sidebarCollapsed={activeTab !== "settings" || accessDetailOpen || versionsOpen}
        ariaLabel={`${library.name} Knowledge library`}
        sidebarAriaLabel="Knowledge library information"
        className={`knowledge-detail-page is-${activeTab}-tab`}
        contentClassName="knowledge-detail-content"
        sidebarClassName="knowledge-detail-sidebar"
      >
        {error ? <p className="knowledge-inline-error" role="alert">{error}</p> : null}
        {activeTab === "general" ? (
          <div className="knowledge-general-stack">
            <section className="platform-service-detail-identity knowledge-library-identity">
              <span className="platform-service-detail-identity__avatar knowledge-library-identity__icon" aria-hidden="true">
                <LibraryBig width={24} height={24} strokeWidth={1.7} />
              </span>
              <div className="platform-service-detail-identity__copy">
                <input
                  className="platform-service-detail-identity__title-input"
                  value={name}
                  readOnly={isHistorical}
                  placeholder="Knowledge library"
                  aria-label="Knowledge library name"
                  onChange={(event) => setName(event.currentTarget.value)}
                />
                <input
                  className="platform-service-detail-identity__description-input"
                  value={description}
                  readOnly={isHistorical}
                  placeholder="Describe what people and agents can learn here"
                  aria-label="Knowledge library description"
                  onChange={(event) => setDescription(event.currentTarget.value)}
                />
              </div>
              {isHistorical ? <PlatformLabel variant="gray">Version preview</PlatformLabel> : null}
            </section>
            {homeDocument ? (
              <PlatformInstructionsEditor
                value={homeMarkdown}
                onChange={setHomeMarkdown}
                title={homeDocument.title}
                placeholder="Introduce this library and link its most important documents."
                ariaLabel={`${library.name} home document`}
                readOnly={isHistorical}
                variant="minimalistic-ui"
                editorMode="rich-text"
                historyKey={`${homeDocument.id}:${homeDocument.revisionId}`}
                className="knowledge-home-editor"
              />
            ) : null}
            <PlatformDataTable
              rows={documents.filter((document) => document.id !== library.homeDocumentId)}
              columns={documentColumns}
              getRowId={(document) => document.id}
              ariaLabel="Knowledge documents"
              className="knowledge-documents-table"
              variant="minimalistic-ui"
              surface="plain"
              sticky={false}
              pagination={false}
              toolbar={{
                title: "Documents",
                search: {
                  placeholder: "Search documents",
                  getSearchText: (document) => `${document.title} ${document.summary} ${document.markdown}`,
                },
                primaryAction: isHistorical ? undefined : {
                  label: "Document",
                  icon: FilePlus2,
                  onClick: () => setCreateDocumentOpen(true),
                },
              }}
              getRowActions={(document): readonly PlatformDataTableAction<KnowledgeDocument>[] => [
                { id: "open", label: "Open", icon: ChevronRight, onSelect: () => onOpenDocument(document) },
                ...(!isHistorical ? [{
                  id: "archive",
                  label: "Archive",
                  icon: Trash2,
                  danger: true,
                  separatorBefore: true,
                  onSelect: () => onRequestArchiveDocument(document),
                } as PlatformDataTableAction<KnowledgeDocument>] : []),
              ]}
              onRowActivate={onOpenDocument}
              getRowAriaLabel={(document) => `Open ${document.title}`}
              emptyState={(
                <PlatformEmptyState
                  icon={BookOpenText}
                  title="No supporting documents yet"
                  description="Add conventions, decisions, procedures, and observations as focused pages."
                  primaryAction={isHistorical ? undefined : {
                    label: "Add Document",
                    icon: FilePlus2,
                    onClick: () => setCreateDocumentOpen(true),
                  }}
                />
              )}
            />
          </div>
        ) : (
          <div className="knowledge-settings-layout">
            <PlatformDeploymentMap
              regionCode={String(library.metadata.region || library.metadata.location || "eur3")}
              title="Location"
            />
            <KnowledgeAccessSettings
              library={library}
              api={api}
              workspaceTeams={workspaceTeams}
              onLibraryChange={onLibraryChange}
              onPermissionDetailOpenChange={setAccessDetailOpen}
            />
          </div>
        )}
      </PlatformServiceDetailPage>
      <PlatformModal
        open={createDocumentOpen}
        title="New Knowledge Document"
        description="Add a focused page to this versioned library."
        as="form"
        size="small"
        onClose={() => !busy && setCreateDocumentOpen(false)}
        surfaceProps={{ onSubmit: createDocument }}
        footer={(
          <>
            <PlatformSecondaryButton size="medium" disabled={busy} onClick={() => setCreateDocumentOpen(false)}>
              Cancel
            </PlatformSecondaryButton>
            <PlatformPrimaryButton size="medium" type="submit" disabled={busy || !documentTitle.trim()}>
              <FilePlus2 width={14} height={14} />
              Create Document
            </PlatformPrimaryButton>
          </>
        )}
      >
        <label className="knowledge-form-field">
          <span>Title</span>
          <input
            value={documentTitle}
            autoFocus
            placeholder="Deployment conventions"
            onChange={(event) => setDocumentTitle(event.currentTarget.value)}
          />
        </label>
      </PlatformModal>
      {(!versionsDrawerPortalId || versionsPortal) ? (
        <PlatformVersionHistorySidebar<KnowledgeLibraryVersion>
          open={versionsOpen}
          title="Version history"
          sectionTitle="All Versions"
          className="knowledge-version-history-sidebar"
          width="var(--playground-thread-task-detail-width)"
          portal={Boolean(versionsPortal)}
          portalTarget={versionsPortal}
          versions={library.versions || []}
          activeVersionId={library.publishedVersionId}
          selectedVersionId={viewedVersionId}
          busy={busy || dirty}
          onClose={() => setVersionsOpen(false)}
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

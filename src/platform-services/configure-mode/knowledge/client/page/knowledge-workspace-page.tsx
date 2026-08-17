import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlatformLoadingState } from "../../../../../platform-ui/components/composite/loading-state/index.js";
import { PlatformConfirmationModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import { PlatformServiceDetailFrame } from "../../../../../platform-ui/pages/details/index.js";
import { KnowledgeApi } from "../api/index.js";
import {
  withKnowledgeLibraryCreatorIdentity,
  withKnowledgeLibraryViewerIdentity,
  type KnowledgeDocument,
  type KnowledgeLibrary,
  type KnowledgeLibraryCreateInput,
} from "../domain/index.js";
import { KnowledgeDocumentDetailPage } from "./knowledge-document-detail-page.js";
import { KnowledgeLibraryCreateModal } from "./knowledge-library-create-modal.js";
import { KnowledgeLibraryDetailPage } from "./knowledge-library-detail-page.js";
import {
  filterKnowledgeLibrariesByScope,
  type KnowledgeOverviewScope,
} from "./knowledge-overview-model.js";
import { KnowledgeOverviewPage } from "./knowledge-overview-page.js";

export type KnowledgeWorkspaceMode = "overview" | "library" | "document";

export interface KnowledgeWorkspacePageProps {
  shouldLoadData?: boolean;
  backendUrl: string;
  requestHeaders?: Readonly<Record<string, string>>;
  mode?: KnowledgeWorkspaceMode;
  selectedLibraryId?: string;
  selectedDocumentId?: string;
  overviewScope?: KnowledgeOverviewScope;
  currentUserId?: string;
  currentUserName?: string;
  currentUserEmail?: string;
  currentUserAvatarUrl?: string;
  controlsPortalId?: string;
  sectionControlsPortalId?: string;
  titleActionsPortalId?: string;
  versionsDrawerPortalId?: string;
  workspaceTeams?: readonly unknown[];
  workspaceTeamsLoading?: boolean;
  activeOrganizationId?: string;
  onWorkspaceTeamsRequest?: () => void;
  onOpenLibrary: (libraryId: string, libraryName?: string) => void;
  onOpenDocument: (
    libraryId: string,
    documentId: string,
    libraryName?: string,
    documentName?: string,
  ) => void;
  onLibraryDeleted?: (libraryId: string) => void;
  onIdentityChange?: (identity: {
    libraryId: string;
    libraryName: string;
    documentId?: string;
    documentName?: string;
    versionNumber?: number;
  }) => void;
  onStartThread?: (library: KnowledgeLibrary) => void;
}

export function KnowledgeWorkspacePage({
  shouldLoadData = true,
  backendUrl,
  requestHeaders = {},
  mode = "overview",
  selectedLibraryId = "",
  selectedDocumentId = "",
  overviewScope = "all",
  currentUserId = "",
  currentUserName = "",
  currentUserEmail = "",
  currentUserAvatarUrl = "",
  controlsPortalId,
  sectionControlsPortalId,
  titleActionsPortalId,
  versionsDrawerPortalId,
  workspaceTeams = [],
  workspaceTeamsLoading = false,
  activeOrganizationId = "",
  onWorkspaceTeamsRequest,
  onOpenLibrary,
  onOpenDocument,
  onLibraryDeleted,
  onIdentityChange,
  onStartThread,
}: KnowledgeWorkspacePageProps) {
  const api = useMemo(() => new KnowledgeApi(backendUrl, requestHeaders), [backendUrl, requestHeaders]);
  const viewerIdentity = useMemo(() => ({
    id: currentUserId,
    name: currentUserName,
    email: currentUserEmail,
    avatarUrl: currentUserAvatarUrl,
  }), [currentUserAvatarUrl, currentUserEmail, currentUserId, currentUserName]);
  const personalizeLibrary = useCallback(
    (library: KnowledgeLibrary) => withKnowledgeLibraryViewerIdentity(library, viewerIdentity),
    [viewerIdentity],
  );
  const identityChangeRef = useRef(onIdentityChange);
  const [libraries, setLibraries] = useState<KnowledgeLibrary[]>([]);
  const [activeLibrary, setActiveLibrary] = useState<KnowledgeLibrary | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteLibrary, setDeleteLibrary] = useState<KnowledgeLibrary | null>(null);
  const [archiveDocument, setArchiveDocument] = useState<KnowledgeDocument | null>(null);
  const scopedLibraries = useMemo(() => filterKnowledgeLibrariesByScope(
    libraries,
    overviewScope,
    {
      id: currentUserId,
      name: currentUserName,
      email: currentUserEmail,
    },
  ), [
    currentUserEmail,
    currentUserId,
    currentUserName,
    libraries,
    overviewScope,
  ]);

  useEffect(() => {
    identityChangeRef.current = onIdentityChange;
  }, [onIdentityChange]);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setLibraries((await api.listLibraries()).map(personalizeLibrary));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load Knowledge.");
    } finally {
      setLoading(false);
    }
  }, [api, personalizeLibrary]);

  const loadLibrary = useCallback(async (libraryId: string) => {
    if (!libraryId) return;
    setDetailLoading(true);
    setError("");
    try {
      const library = personalizeLibrary(await api.getLibrary(libraryId));
      setActiveLibrary(library);
      setLibraries((current) => [library, ...current.filter((item) => item.id !== library.id)]);
      const document = library.documents?.find((item) => item.id === selectedDocumentId);
      identityChangeRef.current?.({
        libraryId: library.id,
        libraryName: library.name,
        documentId: document?.id,
        documentName: document?.title,
        versionNumber: library.currentVersionNumber,
      });
    } catch (nextError) {
      setActiveLibrary(null);
      setError(nextError instanceof Error ? nextError.message : "Failed to load the Knowledge library.");
    } finally {
      setDetailLoading(false);
    }
  }, [api, personalizeLibrary, selectedDocumentId]);

  useEffect(() => {
    if (!shouldLoadData) return;
    if (mode === "overview") void loadOverview();
    else if (selectedLibraryId) void loadLibrary(selectedLibraryId);
  }, [loadLibrary, loadOverview, mode, selectedLibraryId, shouldLoadData]);

  function replaceLibrary(library: KnowledgeLibrary) {
    const personalizedLibrary = personalizeLibrary(library);
    setActiveLibrary((current) => current?.id === personalizedLibrary.id ? {
      ...current,
      ...personalizedLibrary,
      documents: personalizedLibrary.documents || current.documents,
      versions: personalizedLibrary.versions || current.versions,
    } : current);
    setLibraries((current) => [personalizedLibrary, ...current.filter((item) => item.id !== personalizedLibrary.id)]);
    identityChangeRef.current?.({
      libraryId: personalizedLibrary.id,
      libraryName: personalizedLibrary.name,
      versionNumber: personalizedLibrary.currentVersionNumber,
    });
  }

  async function createLibrary(input: KnowledgeLibraryCreateInput) {
    const library = personalizeLibrary(await api.createLibrary(
      withKnowledgeLibraryCreatorIdentity(input, viewerIdentity),
    ));
    setLibraries((current) => [library, ...current]);
    setActiveLibrary(library);
    onOpenLibrary(library.id, library.name);
    return library;
  }

  if (mode === "library" || mode === "document") {
    if (detailLoading || !activeLibrary || activeLibrary.id !== selectedLibraryId) {
      return (
        <div className="knowledge-centered-state">
          {error ? <p className="knowledge-page-error" role="alert">{error}</p> : (
            <PlatformLoadingState centered message="Loading Knowledge library…" />
          )}
        </div>
      );
    }

    if (mode === "document") {
      const document = activeLibrary.documents?.find((item) => item.id === selectedDocumentId) || null;
      if (!document) {
        return <div className="knowledge-centered-state"><p className="knowledge-page-error">Knowledge document not found.</p></div>;
      }
      return (
        <KnowledgeDocumentDetailPage
          library={activeLibrary}
          document={document}
          api={api}
          controlsPortalId={controlsPortalId}
          onDocumentChange={(nextDocument, nextLibrary) => {
            setActiveLibrary((current) => current ? {
              ...current,
              ...nextLibrary,
              documents: (current.documents || []).map((item) => item.id === nextDocument.id ? nextDocument : item),
            } : current);
            identityChangeRef.current?.({
              libraryId: activeLibrary.id,
              libraryName: activeLibrary.name,
              documentId: nextDocument.id,
              documentName: nextDocument.title,
              versionNumber: nextLibrary.currentVersionNumber,
            });
          }}
        />
      );
    }

    return (
      <>
        <PlatformServiceDetailFrame className="knowledge-detail-frame">
          <KnowledgeLibraryDetailPage
            library={activeLibrary}
            api={api}
            sectionControlsPortalId={sectionControlsPortalId}
            titleActionsPortalId={titleActionsPortalId}
            versionsDrawerPortalId={versionsDrawerPortalId}
            workspaceTeams={workspaceTeams}
            workspaceTeamsLoading={workspaceTeamsLoading}
            activeOrganizationId={activeOrganizationId}
            onWorkspaceTeamsRequest={onWorkspaceTeamsRequest}
            onLibraryChange={replaceLibrary}
            onReload={() => loadLibrary(activeLibrary.id)}
            onOpenDocument={(document) => onOpenDocument(
              activeLibrary.id,
              document.id,
              activeLibrary.name,
              document.title,
            )}
            onRequestArchiveDocument={setArchiveDocument}
            onStartThread={onStartThread}
          />
        </PlatformServiceDetailFrame>
        <PlatformConfirmationModal
          open={Boolean(archiveDocument)}
          title="Archive document?"
          description={archiveDocument ? `“${archiveDocument.title}” will be removed from the current draft. Published versions remain immutable.` : ""}
          confirmLabel="Archive"
          tone="destructive"
          onCancel={() => setArchiveDocument(null)}
          onConfirm={async () => {
            if (!archiveDocument) return;
            await api.archiveDocument(activeLibrary.id, archiveDocument.id);
            setArchiveDocument(null);
            await loadLibrary(activeLibrary.id);
          }}
        />
      </>
    );
  }

  return (
    <>
      <KnowledgeOverviewPage
        libraries={scopedLibraries}
        loading={loading}
        error={error}
        controlsPortalId={controlsPortalId}
        onOpen={(library) => onOpenLibrary(library.id, library.name)}
        onCreate={() => setCreateOpen(true)}
        onDelete={setDeleteLibrary}
      />
      <KnowledgeLibraryCreateModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={createLibrary} />
      <PlatformConfirmationModal
        open={Boolean(deleteLibrary)}
        title="Delete Knowledge library?"
        description={deleteLibrary ? `“${deleteLibrary.name}” and all of its documents and versions will be permanently deleted.` : ""}
        confirmLabel="Delete Library"
        tone="destructive"
        onCancel={() => setDeleteLibrary(null)}
        onConfirm={async () => {
          if (!deleteLibrary) return;
          await api.deleteLibrary(deleteLibrary.id);
          setLibraries((current) => current.filter((library) => library.id !== deleteLibrary.id));
          onLibraryDeleted?.(deleteLibrary.id);
          setDeleteLibrary(null);
        }}
      />
    </>
  );
}

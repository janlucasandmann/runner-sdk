import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlatformLoadingState } from "../../../../../platform-ui/components/composite/loading-state/index.js";
import { PlatformConfirmationModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  createPlatformProjectIdentityFallback,
  getPlatformProjectReferenceFromKnowledgeMetadata,
  PlatformProjectIdentityApi,
  type PlatformProjectIdentity,
} from "../../../../../platform-resources/projects/index.js";
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
  workspaceTeamMembers?: readonly unknown[];
  workspaceTeamMembersTeamId?: string;
  activeOrganizationId?: string;
  onWorkspaceTeamsRequest?: () => void;
  onWorkspaceTeamMembersRequest?: (teamId: string) => void | Promise<void>;
  onVersionsSidebarOpenChange?: (open: boolean) => void;
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
  workspaceTeamMembers = [],
  workspaceTeamMembersTeamId = "",
  activeOrganizationId = "",
  onWorkspaceTeamsRequest,
  onWorkspaceTeamMembersRequest,
  onVersionsSidebarOpenChange,
  onOpenLibrary,
  onOpenDocument,
  onLibraryDeleted,
  onIdentityChange,
  onStartThread,
}: KnowledgeWorkspacePageProps) {
  const api = useMemo(() => new KnowledgeApi(backendUrl, requestHeaders), [backendUrl, requestHeaders]);
  const projectIdentityApi = useMemo(
    () => new PlatformProjectIdentityApi(backendUrl, requestHeaders),
    [backendUrl, requestHeaders],
  );
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
  const projectIdentityLoadRef = useRef(0);
  const [libraries, setLibraries] = useState<KnowledgeLibrary[]>([]);
  const [activeLibrary, setActiveLibrary] = useState<KnowledgeLibrary | null>(null);
  const [activeProjectIdentity, setActiveProjectIdentity] = useState<PlatformProjectIdentity | null>(null);
  const [projectIdentitiesById, setProjectIdentitiesById] = useState<
    Readonly<Record<string, PlatformProjectIdentity>>
  >({});
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteLibraries, setDeleteLibraries] = useState<readonly KnowledgeLibrary[]>([]);
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
    const identityLoad = projectIdentityLoadRef.current + 1;
    projectIdentityLoadRef.current = identityLoad;
    setLoading(true);
    setError("");
    try {
      const nextLibraries = (await api.listLibraries()).map(personalizeLibrary);
      const references = [...new Map(
        nextLibraries
          .map((library) => getPlatformProjectReferenceFromKnowledgeMetadata(library.metadata))
          .filter((reference) => reference !== null)
          .map((reference) => [reference.projectId, reference]),
      ).values()];
      const fallbackIdentities = Object.fromEntries(
        references.flatMap((reference) => {
          const identity = createPlatformProjectIdentityFallback(reference);
          return identity ? [[reference.projectId, identity] as const] : [];
        }),
      );
      setLibraries(nextLibraries);
      setProjectIdentitiesById(fallbackIdentities);
      void Promise.all(references.map(async (reference) => {
        try {
          return await projectIdentityApi.get(reference.projectId, reference);
        } catch {
          return createPlatformProjectIdentityFallback(reference);
        }
      })).then((identities) => {
        if (projectIdentityLoadRef.current !== identityLoad) return;
        setProjectIdentitiesById(Object.fromEntries(
          identities.flatMap((identity) => identity ? [[identity.id, identity] as const] : []),
        ));
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load Knowledge.");
    } finally {
      setLoading(false);
    }
  }, [api, personalizeLibrary, projectIdentityApi]);

  const loadLibrary = useCallback(async (libraryId: string, options: { silent?: boolean } = {}) => {
    if (!libraryId) return;
    if (!options.silent) setDetailLoading(true);
    setError("");
    try {
      const library = personalizeLibrary(await api.getLibrary(libraryId));
      const projectReference = getPlatformProjectReferenceFromKnowledgeMetadata(library.metadata);
      let projectIdentity = createPlatformProjectIdentityFallback(projectReference);
      if (projectReference) {
        try {
          projectIdentity = await projectIdentityApi.get(
            projectReference.projectId,
            projectReference,
          );
        } catch {
          // Project metadata remains a stable fallback for offline/local appliances
          // and for users who can read the library but not the source project.
        }
      }
      setActiveLibrary(library);
      setActiveProjectIdentity(projectIdentity);
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
      if (!options.silent) {
        setActiveLibrary(null);
        setActiveProjectIdentity(null);
      }
      setError(nextError instanceof Error ? nextError.message : "Failed to load the Knowledge library.");
    } finally {
      if (!options.silent) setDetailLoading(false);
    }
  }, [api, personalizeLibrary, projectIdentityApi, selectedDocumentId]);

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
    setActiveProjectIdentity(null);
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
      <KnowledgeLibraryDetailPage
        library={activeLibrary}
        relatedProjectIdentity={activeProjectIdentity}
        api={api}
        backendUrl={backendUrl}
        requestHeaders={requestHeaders}
        controlsPortalId={controlsPortalId}
        sectionControlsPortalId={sectionControlsPortalId}
        titleActionsPortalId={titleActionsPortalId}
        versionsDrawerPortalId={versionsDrawerPortalId}
        workspaceTeams={workspaceTeams}
        workspaceTeamsLoading={workspaceTeamsLoading}
        workspaceTeamMembers={workspaceTeamMembers}
        workspaceTeamMembersTeamId={workspaceTeamMembersTeamId}
        activeOrganizationId={activeOrganizationId}
        onWorkspaceTeamsRequest={onWorkspaceTeamsRequest}
        onWorkspaceTeamMembersRequest={onWorkspaceTeamMembersRequest}
        onVersionsSidebarOpenChange={onVersionsSidebarOpenChange}
        onLibraryChange={replaceLibrary}
        onReload={() => loadLibrary(activeLibrary.id, { silent: true })}
        onLibraryDeleted={onLibraryDeleted}
        onStartThread={onStartThread}
      />
    );
  }

  return (
    <>
      <KnowledgeOverviewPage
        libraries={scopedLibraries}
        projectIdentitiesById={projectIdentitiesById}
        loading={loading}
        error={error}
        controlsPortalId={controlsPortalId}
        onOpen={(library) => onOpenLibrary(library.id, library.name)}
        onCreate={() => setCreateOpen(true)}
        onDelete={setDeleteLibraries}
      />
      <KnowledgeLibraryCreateModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={createLibrary} />
      <PlatformConfirmationModal
        open={deleteLibraries.length > 0}
        title={deleteLibraries.length === 1 ? "Delete Knowledge library?" : `Delete ${deleteLibraries.length} Knowledge libraries?`}
        description={deleteLibraries.length === 1
          ? `“${deleteLibraries[0]?.name}” and all of its documents and versions will be permanently deleted.`
          : "The selected libraries and all of their documents and versions will be permanently deleted."}
        confirmLabel={deleteLibraries.length === 1 ? "Delete Library" : "Delete Libraries"}
        tone="destructive"
        onCancel={() => setDeleteLibraries([])}
        onConfirm={async () => {
          if (!deleteLibraries.length) return;
          const results = await Promise.allSettled(
            deleteLibraries.map((library) => api.deleteLibrary(library.id)),
          );
          const deletedIds = new Set(
            deleteLibraries
              .filter((_, index) => results[index]?.status === "fulfilled")
              .map((library) => library.id),
          );
          const failedLibraries = deleteLibraries.filter(
            (_, index) => results[index]?.status === "rejected",
          );
          if (deletedIds.size) {
            setLibraries((current) => current.filter((library) => !deletedIds.has(library.id)));
            deletedIds.forEach((id) => onLibraryDeleted?.(id));
          }
          setDeleteLibraries(failedLibraries);
          if (failedLibraries.length) {
            throw new Error(
              failedLibraries.length === 1
                ? `Failed to delete ${failedLibraries[0]?.name || "the Knowledge library"}.`
                : `Failed to delete ${failedLibraries.length} Knowledge libraries.`,
            );
          }
        }}
      />
    </>
  );
}

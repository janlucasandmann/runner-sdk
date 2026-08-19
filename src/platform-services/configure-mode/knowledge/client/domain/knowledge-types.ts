export interface KnowledgePersonIdentity {
  id: string;
  userId?: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface KnowledgeViewerIdentity {
  id?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

export interface KnowledgeDocument {
  id: string;
  libraryId: string;
  revisionId: string;
  currentRevisionId: string;
  parentDocumentId: string;
  slug: string;
  sortOrder: number;
  archived: boolean;
  title: string;
  name: string;
  summary: string;
  description: string;
  markdown: string;
  content: string;
  contentHash: string;
  provenance: Record<string, unknown>;
  createdByUserId: string;
  revisionCreatedByUserId: string;
  createdAt: string;
  revisionCreatedAt: string;
  updatedAt: string;
}

export interface KnowledgeLibraryVersion {
  id: string;
  number: number;
  versionNumber: number;
  name: string;
  description: string;
  status: "saved" | "published";
  fingerprint: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeLibrary {
  id: string;
  name: string;
  description: string;
  homeDocumentId: string;
  creatorId: string;
  creatorUserId: string;
  creatorName: string;
  creatorEmail: string;
  creatorAvatarUrl: string;
  ownerId: string;
  ownerUserId: string;
  ownerName: string;
  ownerEmail: string;
  ownerAvatarUrl: string;
  createdAt: string;
  updatedAt: string;
  currentVersionId: string;
  currentVersionNumber: number;
  publishedVersionId: string;
  metadata: Record<string, unknown>;
  permissionSet: Record<string, unknown> | null;
  documents?: KnowledgeDocument[];
  versions?: KnowledgeLibraryVersion[];
}

export interface KnowledgeLibraryCreateInput {
  name: string;
  description?: string;
  homeTitle?: string;
  homeMarkdown?: string;
  metadata?: Record<string, unknown>;
  permissionSet?: Record<string, unknown> | null;
}

export interface KnowledgeDocumentCreateInput {
  title: string;
  summary?: string;
  markdown?: string;
  parentDocumentId?: string | null;
  sortOrder?: number;
  provenance?: Record<string, unknown>;
}

export interface KnowledgeDocumentUpdateInput
  extends Partial<KnowledgeDocumentCreateInput> {
  baseRevisionId?: string;
}

export type KnowledgeProposalOperation =
  | "create_document"
  | "update_document"
  | "archive_document";

/** A reviewable write proposed by an agent or automation run. */
export interface KnowledgeProposalInput {
  operation: KnowledgeProposalOperation;
  documentId?: string;
  baseVersionId?: string;
  baseRevisionId?: string;
  title?: string;
  summary?: string;
  markdown?: string;
  parentDocumentId?: string | null;
  provenance?: Record<string, unknown>;
  threadId?: string;
}

export interface KnowledgeProposal {
  /** Stable proposal id when the upstream control plane exposes one. */
  id?: string;
  libraryId: string;
  operation: KnowledgeProposalOperation;
  status: "draft" | "pending" | "approved" | "rejected" | "applied" | "expired";
  documentId?: string;
  baseVersionId?: string;
  baseRevisionId?: string;
  requestedByUserId?: string;
  requestedAt?: string;
  appliedAt?: string;
  payload?: Record<string, unknown>;
  provenance?: Record<string, unknown>;
  /** Current draft result returned by the appliance proposal contract. */
  library?: KnowledgeLibrary;
  version?: KnowledgeLibraryVersion;
  document?: KnowledgeDocument;
}

export interface KnowledgeSearchResult {
  libraryId: string;
  libraryName: string;
  libraryVersionId: string;
  libraryVersionNumber: number;
  libraryFingerprint: string;
  documentId: string;
  revisionId: string;
  title: string;
  slug: string;
  summary: string;
  excerpt: string;
  contentHash: string;
  provenance: Record<string, unknown>;
  score: number;
  citationId: string;
}

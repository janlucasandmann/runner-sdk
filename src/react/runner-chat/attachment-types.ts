import type { RunnerPreviewAttachment } from "../runner-document-preview.js";

export interface RunnerAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  type: "image" | "document";
  uploadedAt: string;
  url?: string;
  workspacePath?: string;
  gcsPath?: string;
  integrationSource?: "google-drive" | "one-drive" | "github";
  githubRepoFullName?: string;
  githubRef?: string | null;
  githubItemPath?: string;
  githubSelectionType?: "repo" | "file";
  /** Identifies attachments created from a saved prompt or thread reference. */
  referenceType?: "prompt" | "thread";
  displayName?: string;
  promptId?: string;
  promptVersionId?: string;
  promptVersionNumber?: number;
  threadId?: string;
  [key: string]: unknown;
}

export interface RunnerChatImplicitAttachment {
  url: string;
  filename: string;
  mimeType?: string;
  type?: RunnerAttachment["type"];
  hiddenFromTurnDisplay?: boolean;
  runnerAttachmentRole?: string;
}

export type RunnerTurnAttachment = RunnerPreviewAttachment;

export interface LocalAttachment {
  id: string;
  file: File;
  type: RunnerAttachment["type"];
  previewUrl?: string;
  source: "local" | "workspace" | "integration";
  hiddenFromTurnDisplay?: boolean;
  runnerAttachmentRole?: string;
  sourceEnvironmentId?: string | null;
  integrationSource?: "google-drive" | "one-drive" | "github";
  githubRepoFullName?: string;
  githubRef?: string | null;
  githubItemPath?: string;
  githubSelectionType?: "repo" | "file";
  /** Identifies attachments created from a saved prompt or thread reference. */
  referenceType?: "prompt" | "thread";
  displayName?: string;
  promptId?: string;
  promptVersionId?: string;
  promptVersionNumber?: number;
  threadId?: string;
  resolvedAttachment?: RunnerAttachment;
  uploadStatus?: "idle" | "uploading" | "uploaded" | "failed";
  uploadError?: string | null;
}

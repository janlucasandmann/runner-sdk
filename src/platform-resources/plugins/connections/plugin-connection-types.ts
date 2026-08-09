import type { PlatformConnectionCredential } from "../../shared/connections/connection-credentials.js";
import type {
  PlatformConnectorAuthentication,
  PlatformConnectorId,
} from "../../../platform-integrations/connectors/index.js";

export type PlatformPluginConnectionId = Exclude<
  PlatformConnectorId,
  "discord" | "telegram" | "email"
>;

export interface PlatformPluginConnectionDefinition {
  id: PlatformPluginConnectionId;
  label: string;
  category: string;
  logoUrl: string;
  authentication: PlatformConnectorAuthentication;
  statusPath: string;
  loginPath: string;
  disconnectPath: string;
  credentialsPath: string;
}

export interface PlatformPluginConnectionStatus {
  connected: boolean;
  profile?: Record<string, unknown>;
  credentials?: PlatformConnectionCredential[];
  defaultCredentialId?: string;
  scope?: string;
  tokenType?: string;
  expiresAt?: number | null;
  reason?: string;
}

export interface PlatformPluginConnectionReturnTarget {
  toolsView: "tags" | "plugins";
  resourceId: string;
  tab: "authentication";
}

export interface PlatformPluginConnectionReturnUrlState
  extends PlatformPluginConnectionReturnTarget {
  provider: PlatformPluginConnectionId;
  savedAt: number;
  credentialId?: string;
  result?: "success" | "error";
  error?: string;
}

export interface PlatformPluginConnectionRedirectState extends Record<string, unknown> {
  provider: PlatformPluginConnectionId;
  savedAt: number;
  credentialId?: string;
  credentialName?: string;
  returnTarget?: PlatformPluginConnectionReturnTarget;
}

export interface PlatformPluginConnectionStart {
  authUrl: string;
  state?: string;
}

export interface PlatformGitHubRepositoryBranch {
  name: string;
  protected: boolean;
}

export type PlatformPluginFileConnectionId = Extract<
  PlatformPluginConnectionId,
  "github" | "google-drive" | "one-drive" | "gitlab" | "notion" | "sharepoint"
>;

export interface PlatformPluginFileSourceDefinition {
  id: PlatformPluginFileConnectionId;
  label: string;
  logoUrl: string;
}

export interface PlatformPluginFileAccount {
  id: string;
  name: string;
  identity: string;
  isDefault: boolean;
  status: PlatformConnectionCredential["status"];
}

export interface PlatformPluginFileSourceStatus
  extends PlatformPluginFileSourceDefinition {
  accounts: PlatformPluginFileAccount[];
  connected: boolean;
  defaultCredentialId?: string;
  identity: string;
  error?: string;
}

export interface PlatformPluginFileItem {
  id: string;
  providerId: PlatformPluginFileConnectionId;
  name: string;
  path: string;
  isFolder: boolean;
  size: number;
  modifiedTime?: string;
  createdTime?: string;
  mimeType?: string;
  previewUrl?: string;
  webUrl?: string;
  repoFullName?: string;
  ref?: string;
}

export interface PlatformPluginFileContent {
  content: string;
  encoding: "base64" | "utf8";
  mimeType?: string;
  name: string;
}

export interface PlatformPluginFileRequestOptions {
  credentialId?: string;
  fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  signal?: AbortSignal;
  organizationId?: string;
  forceRefresh?: boolean;
}

import type { PlatformConnectionCredential } from "../../shared/connections/connection-credentials.js";

export const PLATFORM_PLUGIN_CONNECTION_IDS = [
  "github",
  "notion",
  "google-drive",
  "gmail",
  "one-drive",
  "jira",
] as const;

export type PlatformPluginConnectionId = (typeof PLATFORM_PLUGIN_CONNECTION_IDS)[number];

export interface PlatformPluginConnectionDefinition {
  id: PlatformPluginConnectionId;
  label: string;
  category:
    | "Source control"
    | "Knowledge"
    | "Storage"
    | "Channels"
    | "Project management";
  logoUrl: string;
  statusPath: string;
  loginPath: string;
  disconnectPath: string;
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

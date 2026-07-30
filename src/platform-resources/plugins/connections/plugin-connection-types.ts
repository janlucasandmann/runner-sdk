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

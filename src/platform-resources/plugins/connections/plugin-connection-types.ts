export const PLATFORM_PLUGIN_CONNECTION_IDS = [
  "github",
  "notion",
  "google-drive",
  "gmail",
  "one-drive",
] as const;

export type PlatformPluginConnectionId = (typeof PLATFORM_PLUGIN_CONNECTION_IDS)[number];

export interface PlatformPluginConnectionDefinition {
  id: PlatformPluginConnectionId;
  label: string;
  category: "Source control" | "Knowledge" | "Storage" | "Channels";
  logoUrl: string;
  statusPath: string;
  loginPath: string;
  disconnectPath: string;
}

export interface PlatformPluginConnectionStatus {
  connected: boolean;
  profile?: Record<string, unknown>;
  scope?: string;
  tokenType?: string;
  expiresAt?: number | null;
  reason?: string;
}

export interface PlatformPluginConnectionRedirectState extends Record<string, unknown> {
  provider: PlatformPluginConnectionId;
  savedAt: number;
}

export interface PlatformPluginConnectionStart {
  authUrl: string;
  state?: string;
}

export interface PlatformGitHubRepositoryBranch {
  name: string;
  protected: boolean;
}

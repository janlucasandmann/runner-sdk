import {
  PlatformConnectorConfiguration,
} from "../../platform-ui/components/composite/connector-configuration/index.js";

export type RunnerProjectConnectorResourceProvider =
  | "google-drive"
  | "one-drive"
  | "notion"
  | "atlassian";

export interface RunnerProjectConnectorResourceSettingsProps {
  provider: RunnerProjectConnectorResourceProvider;
  resourceId: string;
  resourceName: string;
  resourceType?: string;
  resourcePath?: string;
  onDisconnect?: () => void | Promise<void>;
}

const PROVIDER_FALLBACK_LABELS: Record<RunnerProjectConnectorResourceProvider, string> = {
  "google-drive": "Drive resource",
  "one-drive": "OneDrive resource",
  notion: "Notion resource",
  atlassian: "Atlassian resource",
};

function formatResourceType(provider: RunnerProjectConnectorResourceProvider, value?: string) {
  const normalized = String(value || "")
    .trim()
    .replace(/^application\/(?:x-)?/, "")
    .replace(/^atlassian[-_:]/, "")
    .replace(/[-_:]+/g, " ");
  if (normalized) {
    if (normalized.toLowerCase() === "pdf") return "PDF";
    return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
  if (provider === "google-drive") return "Google Drive";
  if (provider === "one-drive") return "OneDrive";
  if (provider === "notion") return "Database";
  return "Atlassian";
}

/**
 * Shared presentation for an explicitly selected project connector resource.
 * The component is deliberately identity-only: resource selection and access
 * enforcement remain owned by the central explorer and runtime PEP.
 */
export function RunnerProjectConnectorResourceSettings({
  provider,
  resourceId,
  resourceName,
  resourceType,
  resourcePath,
  onDisconnect,
}: RunnerProjectConnectorResourceSettingsProps) {
  const resolvedName = String(resourceName || "").trim() || PROVIDER_FALLBACK_LABELS[provider];
  const resolvedPath = String(resourcePath || "").trim();
  const typeLabel = formatResourceType(provider, resourceType);

  return (
    <PlatformConnectorConfiguration
      className={`playground-project-connector-resource-settings playground-project-${provider}-resource-settings`}
      data-project-connector-provider={provider}
      data-project-connector-resource={resourceId}
      title={<span title={resolvedPath || resolvedName}>{resolvedName}</span>}
      metadata={typeLabel}
      actionLabel={`Actions for ${resolvedName}`}
      onDisconnect={onDisconnect}
    />
  );
}

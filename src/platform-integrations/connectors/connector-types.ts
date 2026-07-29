export type PlatformConnectorKind = "plugin" | "tag";

export type PlatformConnectorCapabilityAccess = "interactive" | "read-only";

export type PlatformConnectorAuthentication =
  | "oauth2"
  | "webhook"
  | "bot"
  | "email";

export interface PlatformConnectorJsonSchema {
  type?: string | readonly string[];
  description?: string;
  properties?: Readonly<Record<string, PlatformConnectorJsonSchema>>;
  required?: readonly string[];
  items?: PlatformConnectorJsonSchema;
  oneOf?: readonly PlatformConnectorJsonSchema[];
  enum?: readonly unknown[];
  minimum?: number;
  maximum?: number;
  minItems?: number;
  additionalProperties?: boolean | PlatformConnectorJsonSchema;
  [key: string]: unknown;
}

export interface PlatformConnectorCapability {
  id: string;
  title: string;
  description: string;
  access: PlatformConnectorCapabilityAccess;
  iconKey: "workflow" | "skill" | "channel";
  inputSchema: PlatformConnectorJsonSchema;
}

export interface PlatformConnectorFeature {
  id: string;
  title: string;
  kind: string;
  description: string;
  iconKey: "app" | "skill" | "workflow" | "channel";
}

export interface PlatformConnectorCatalogEntry<TId extends string = string> {
  id: TId;
  kind: PlatformConnectorKind;
  label: string;
  shortLabel: string;
  description: string;
  category: string;
  logoUrl?: string;
  iconKey?: "mail" | "channel";
  authentication: PlatformConnectorAuthentication;
  authenticationLabel: string;
  websiteUrl: string;
  termsUrl: string;
  privacyUrl: string;
  permissionSubjectType: string;
  permissionTeamSubjectType: string;
  capabilities: readonly PlatformConnectorCapability[];
  categoryLabel: string;
  functionsLabel: string;
  samplePrompt: string;
  whenToUse: string;
  features: readonly PlatformConnectorFeature[];
}

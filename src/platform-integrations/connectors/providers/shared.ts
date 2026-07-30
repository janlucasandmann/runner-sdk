import type {
  PlatformConnectorCapability,
  PlatformConnectorCapabilityAccess,
  PlatformConnectorCatalogEntry,
  PlatformConnectorFeature,
  PlatformConnectorJsonSchema,
} from "../connector-types.js";

export interface ConnectorCapabilityDefinition {
  id: string;
  description: string;
  access: PlatformConnectorCapabilityAccess;
  properties?: Readonly<Record<string, PlatformConnectorJsonSchema>>;
  required?: readonly string[];
}

export interface ConnectorProviderDefinition<TId extends string = string> {
  id: TId;
  label: string;
  shortLabel: string;
  description: string;
  category: string;
  logoUrl: string;
  authentication?: PlatformConnectorCatalogEntry["authentication"];
  authenticationLabel?: string;
  functionsLabel: string;
  samplePrompt: string;
  whenToUse: string;
  websiteUrl: string;
  termsUrl: string;
  privacyUrl: string;
  features?: readonly PlatformConnectorFeature[];
}

export const stringField = (
  description: string,
  extra: Partial<PlatformConnectorJsonSchema> = {},
): PlatformConnectorJsonSchema => Object.freeze({
  type: "string",
  description,
  ...extra,
});

export const numberField = (
  description: string,
  extra: Partial<PlatformConnectorJsonSchema> = {},
): PlatformConnectorJsonSchema => Object.freeze({
  type: "number",
  description,
  ...extra,
});

export const booleanField = (
  description: string,
): PlatformConnectorJsonSchema => Object.freeze({
  type: "boolean",
  description,
});

export const stringArrayField = (
  description: string,
): PlatformConnectorJsonSchema => Object.freeze({
  type: "array",
  description,
  items: Object.freeze({ type: "string" }),
});

export function defineCapabilities(
  definitions: readonly ConnectorCapabilityDefinition[],
): readonly PlatformConnectorCapability[] {
  const ids = new Set<string>();
  return Object.freeze(definitions.map((definition) => {
    if (!definition.id || ids.has(definition.id)) {
      throw new TypeError(`Connector capability IDs must be unique: ${definition.id}`);
    }
    ids.add(definition.id);
    return Object.freeze({
      id: definition.id,
      title: definition.id,
      description: definition.description,
      access: definition.access,
      iconKey: definition.access === "read-only" ? "skill" : "workflow",
      inputSchema: Object.freeze({
        type: "object",
        properties: Object.freeze({ ...(definition.properties || {}) }),
        required: Object.freeze([...(definition.required || [])]),
      }),
    });
  }));
}

function defaultFeatures(
  definition: ConnectorProviderDefinition,
): readonly PlatformConnectorFeature[] {
  return Object.freeze([
    Object.freeze({
      id: `${definition.id}-context`,
      title: `${definition.label} context`,
      kind: "App",
      description: definition.description,
      iconKey: "app" as const,
    }),
    Object.freeze({
      id: `${definition.id}-actions`,
      title: `${definition.label} actions`,
      kind: "Workflow",
      description: definition.whenToUse,
      iconKey: "workflow" as const,
    }),
  ]);
}

export function defineConnectorProvider<TId extends string>(
  definition: ConnectorProviderDefinition<TId>,
  capabilities: readonly PlatformConnectorCapability[],
): PlatformConnectorCatalogEntry<TId> {
  const normalizedId = definition.id.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(normalizedId)) {
    throw new TypeError(`Invalid connector provider ID: ${definition.id}`);
  }
  const subjectPrefix = `${normalizedId.replaceAll("-", "_")}_plugin`;
  return Object.freeze({
    ...definition,
    id: normalizedId as TId,
    kind: "plugin",
    authentication: definition.authentication || "oauth2",
    authenticationLabel: definition.authenticationLabel || "OAuth 2.0",
    categoryLabel: "Workspace Integration",
    permissionSubjectType: subjectPrefix,
    permissionTeamSubjectType: `${subjectPrefix}_team_role`,
    capabilities,
    features: Object.freeze([
      ...(definition.features || defaultFeatures(definition)),
    ]),
  });
}

export const paginationFields = Object.freeze({
  cursor: stringField("Opaque pagination cursor returned by the provider."),
  limit: numberField("Maximum number of results to return.", {
    minimum: 1,
    maximum: 100,
  }),
});

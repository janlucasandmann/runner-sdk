import {
  getPlatformConnectorCatalogEntry,
  PLATFORM_CONNECTOR_IDS,
  type PlatformConnectorId,
} from "./connector-catalog.js";
import type { PlatformConnectorCapabilityAccess } from "./connector-types.js";

export interface PlatformConnectorPermissionActionDescriptor {
  id: string;
  connectorId: PlatformConnectorId;
  capabilityId: string;
  ringId: "ring_1" | "ring_3";
  label: string;
  description: string;
  subjectTypes: readonly string[];
}

export function getPlatformConnectorPermissionActionId(
  connectorId: string,
  capabilityId: string,
): string {
  const connectorPrefix = String(connectorId || "")
    .trim()
    .toLowerCase()
    .replaceAll("-", "_");
  return `${connectorPrefix}_action_${String(capabilityId || "").trim()}`;
}

export function getPlatformConnectorPermissionRingId(
  access: PlatformConnectorCapabilityAccess,
): "ring_1" | "ring_3" {
  return access === "interactive" ? "ring_3" : "ring_1";
}

export function getPlatformConnectorPermissionSubjectTypes(
  connectorId: string,
): { subjectType: string; teamSubjectType: string } | undefined {
  const connector = getPlatformConnectorCatalogEntry(connectorId);
  return connector
    ? {
        subjectType: connector.permissionSubjectType,
        teamSubjectType: connector.permissionTeamSubjectType,
      }
    : undefined;
}

export function listPlatformConnectorPermissionActionDescriptors(
  connectorId?: string,
): readonly PlatformConnectorPermissionActionDescriptor[] {
  const connectorIds = connectorId
    ? ([String(connectorId).trim().toLowerCase()] as string[])
    : PLATFORM_CONNECTOR_IDS;
  return connectorIds.flatMap((id) => {
    const connector = getPlatformConnectorCatalogEntry(id);
    if (!connector) return [];
    const subjectTypes = Object.freeze([
      "agent",
      connector.permissionSubjectType,
      connector.permissionTeamSubjectType,
    ]);
    return connector.capabilities.map((capability) =>
      Object.freeze({
        id: getPlatformConnectorPermissionActionId(
          connector.id,
          capability.id,
        ),
        connectorId: connector.id,
        capabilityId: capability.id,
        ringId: getPlatformConnectorPermissionRingId(capability.access),
        label: capability.title,
        description: capability.description,
        subjectTypes,
      }),
    );
  });
}

export const PLATFORM_CONNECTOR_PERMISSION_SUBJECT_TYPES = Object.freeze(
  PLATFORM_CONNECTOR_IDS.map(
    (id) => getRequiredPlatformConnectorCatalogEntry(id).permissionSubjectType,
  ),
);

export const PLATFORM_CONNECTOR_TEAM_PERMISSION_SUBJECT_TYPES = Object.freeze(
  PLATFORM_CONNECTOR_IDS.map(
    (id) => getRequiredPlatformConnectorCatalogEntry(id).permissionTeamSubjectType,
  ),
);

function getRequiredPlatformConnectorCatalogEntry(id: PlatformConnectorId) {
  const entry = getPlatformConnectorCatalogEntry(id);
  if (!entry) throw new Error(`Unknown connector: ${id}`);
  return entry;
}

export function isPlatformConnectorPermissionSubjectType(
  subjectType: string,
): boolean {
  const normalizedSubjectType = String(subjectType || "").trim();
  return (
    PLATFORM_CONNECTOR_PERMISSION_SUBJECT_TYPES.includes(
      normalizedSubjectType as (typeof PLATFORM_CONNECTOR_PERMISSION_SUBJECT_TYPES)[number],
    ) ||
    PLATFORM_CONNECTOR_TEAM_PERMISSION_SUBJECT_TYPES.includes(
      normalizedSubjectType as (typeof PLATFORM_CONNECTOR_TEAM_PERMISSION_SUBJECT_TYPES)[number],
    )
  );
}

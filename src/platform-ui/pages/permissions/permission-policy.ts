import {
  PLATFORM_LEGACY_SERVER_PERMISSION_ACTION_ALIASES,
  PLATFORM_PERMISSION_ACTION_DEFINITIONS,
  PLATFORM_PERMISSION_RESOURCE_TYPES,
  PLATFORM_PERMISSION_RING_DEFINITIONS,
  PLATFORM_PERMISSION_RING_IDS,
  PLATFORM_PERMISSION_SUBJECT_TYPES,
  type PlatformPermissionSubjectType,
} from "./permission-catalog.js";
import {
  getPlatformPermissionActionExplicitAccess,
  getPlatformPermissionActionRingId,
  getPlatformPermissionRingAccess,
  normalizePlatformPermissionAccess,
  PLATFORM_PERMISSION_ACCESS_OPTIONS,
  shouldShowPlatformPermissionAction,
} from "./permission-model.js";
import type {
  PlatformPermissionAccess,
  PlatformPermissionActionDefinition,
  PlatformPermissionActionPolicy,
  PlatformPermissionResourcePolicy,
  PlatformPermissionRingPolicy,
  PlatformPermissionRule,
  PlatformPermissionSet,
} from "./permission-types.js";

export function isPlatformPermissionRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function normalizePlatformPermissionAccessValue(
  value: unknown,
  fallback: PlatformPermissionAccess = "full_access",
): PlatformPermissionAccess {
  return normalizePlatformPermissionAccess(value, PLATFORM_PERMISSION_ACCESS_OPTIONS, fallback);
}

export function normalizePlatformPermissionRingId(value: unknown, fallback = "ring_1"): string {
  return PLATFORM_PERMISSION_RING_IDS.includes(String(value)) ? String(value) : fallback;
}

export function normalizePlatformPermissionSubjectType(
  value: unknown,
  fallback: PlatformPermissionSubjectType = "agent",
): PlatformPermissionSubjectType {
  const normalized = String(value || "").trim() as PlatformPermissionSubjectType;
  return PLATFORM_PERMISSION_SUBJECT_TYPES.includes(normalized) ? normalized : fallback;
}

export function createPlatformDefaultPermissionRings(): Record<string, PlatformPermissionRingPolicy> {
  return Object.fromEntries(
    PLATFORM_PERMISSION_RING_DEFINITIONS.map((ring) => [
      ring.id,
      { defaultAccess: ring.defaultAccess },
    ]),
  );
}

export function createPlatformDefaultPermissionActions(
  subjectType?: PlatformPermissionSubjectType,
): Record<string, PlatformPermissionActionPolicy> {
  const actionDefinitions = subjectType
    ? PLATFORM_PERMISSION_ACTION_DEFINITIONS.filter((action) => shouldShowPlatformPermissionAction(action, subjectType))
    : PLATFORM_PERMISSION_ACTION_DEFINITIONS;
  return Object.fromEntries(
    actionDefinitions.map((action) => [
      action.id,
      { ringId: action.ringId },
    ]),
  );
}

export function createPlatformDefaultPermissionResources(
  defaultAccess: PlatformPermissionAccess = "full_access",
): Record<string, PlatformPermissionResourcePolicy> {
  return Object.fromEntries(
    PLATFORM_PERMISSION_RESOURCE_TYPES.map((resourceType) => [
      resourceType,
      { defaultAccess, rules: [] },
    ]),
  );
}

function normalizePermissionRings(value: unknown): Record<string, PlatformPermissionRingPolicy> {
  const rings = createPlatformDefaultPermissionRings();
  const inputRings = isPlatformPermissionRecord(value) ? value : {};

  for (const ring of PLATFORM_PERMISSION_RING_DEFINITIONS) {
    const ringValue = inputRings[ring.id];
    if (typeof ringValue === "string") {
      rings[ring.id] = {
        defaultAccess: normalizePlatformPermissionAccessValue(ringValue, ring.defaultAccess),
      };
      continue;
    }
    if (isPlatformPermissionRecord(ringValue)) {
      rings[ring.id] = {
        defaultAccess: normalizePlatformPermissionAccessValue(ringValue.defaultAccess, ring.defaultAccess),
      };
    }
  }

  return rings;
}

function normalizePermissionActions(
  value: unknown,
  subjectType: PlatformPermissionSubjectType,
): Record<string, PlatformPermissionActionPolicy> {
  const actions = createPlatformDefaultPermissionActions(subjectType);
  const inputActions = isPlatformPermissionRecord(value) ? value : {};
  const legacyAliases = PLATFORM_LEGACY_SERVER_PERMISSION_ACTION_ALIASES[
    subjectType as keyof typeof PLATFORM_LEGACY_SERVER_PERMISSION_ACTION_ALIASES
  ];

  for (const action of PLATFORM_PERMISSION_ACTION_DEFINITIONS.filter(
    (definition) => shouldShowPlatformPermissionAction(definition, subjectType),
  )) {
    const legacyActionId = legacyAliases?.[action.id];
    const actionValue = inputActions[action.id] ?? (legacyActionId ? inputActions[legacyActionId] : undefined);
    if (typeof actionValue === "string") {
      const access = normalizePlatformPermissionAccessValue(actionValue, "");
      actions[action.id] = {
        ringId: action.ringId,
        ...(access ? { access } : {}),
      };
      continue;
    }
    if (isPlatformPermissionRecord(actionValue)) {
      const access = normalizePlatformPermissionAccessValue(actionValue.access, "");
      actions[action.id] = {
        ringId: normalizePlatformPermissionRingId(actionValue.ringId, action.ringId),
        ...(access ? { access } : {}),
      };
    }
  }

  return actions;
}

function normalizePermissionRules(
  value: unknown,
  fallbackAccess: PlatformPermissionAccess,
): PlatformPermissionRule[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((rule) => {
    if (!isPlatformPermissionRecord(rule)) return [];
    const normalizedRule: PlatformPermissionRule = {
      access: normalizePlatformPermissionAccessValue(rule.access, fallbackAccess),
    };
    if (typeof rule.id === "string" && rule.id.trim()) normalizedRule.id = rule.id.trim();
    if (typeof rule.targetId === "string" && rule.targetId.trim()) normalizedRule.targetId = rule.targetId.trim();
    if (typeof rule.path === "string" && rule.path.trim()) normalizedRule.path = rule.path.trim();
    if (typeof rule.note === "string" && rule.note.trim()) normalizedRule.note = rule.note.trim();
    return [normalizedRule];
  });
}

export function createPlatformDefaultPermissionSet(
  subjectType: PlatformPermissionSubjectType = "agent",
): PlatformPermissionSet {
  const normalizedSubjectType = normalizePlatformPermissionSubjectType(subjectType, "agent");
  return {
    version: 1,
    subjectType: normalizedSubjectType,
    defaultAccess: "full_access",
    rings: createPlatformDefaultPermissionRings(),
    actions: createPlatformDefaultPermissionActions(normalizedSubjectType),
    resources: createPlatformDefaultPermissionResources("full_access"),
  };
}

export function createPlatformFullAccessPermissionSet(
  subjectType: PlatformPermissionSubjectType = "agent",
): PlatformPermissionSet {
  const permissionSet = createPlatformDefaultPermissionSet(subjectType);
  permissionSet.rings = Object.fromEntries(
    PLATFORM_PERMISSION_RING_IDS.map((ringId) => [ringId, { defaultAccess: "full_access" }]),
  );
  permissionSet.actions = Object.fromEntries(
    PLATFORM_PERMISSION_ACTION_DEFINITIONS
      .filter((action) => shouldShowPlatformPermissionAction(action, subjectType))
      .map((action) => [
      action.id,
      {
        ringId: normalizePlatformPermissionRingId(action.ringId, "ring_1"),
        access: "full_access",
      },
    ]),
  );
  permissionSet.resources = createPlatformDefaultPermissionResources("full_access");
  return permissionSet;
}

export function normalizePlatformPermissionSet(
  value: unknown,
  subjectType?: PlatformPermissionSubjectType,
): PlatformPermissionSet {
  const storedSubjectType = isPlatformPermissionRecord(value)
    ? normalizePlatformPermissionSubjectType(value.subjectType, "agent")
    : "agent";
  const fallbackSubjectType = subjectType === undefined
    ? storedSubjectType
    : normalizePlatformPermissionSubjectType(subjectType, "agent");
  const fallback = createPlatformDefaultPermissionSet(fallbackSubjectType);
  if (!isPlatformPermissionRecord(value)) return fallback;

  const normalizedSubjectType = subjectType === undefined ? storedSubjectType : fallbackSubjectType;
  const defaultAccess = normalizePlatformPermissionAccessValue(
    value.defaultAccess,
    fallback.defaultAccess,
  );
  const resources = createPlatformDefaultPermissionResources(defaultAccess);
  const inputResources = isPlatformPermissionRecord(value.resources) ? value.resources : {};

  for (const resourceType of PLATFORM_PERMISSION_RESOURCE_TYPES) {
    const resourceValue = inputResources[resourceType];
    if (typeof resourceValue === "string") {
      resources[resourceType] = {
        defaultAccess: normalizePlatformPermissionAccessValue(resourceValue, defaultAccess),
        rules: [],
      };
      continue;
    }
    if (!isPlatformPermissionRecord(resourceValue)) continue;
    const resourceDefaultAccess = normalizePlatformPermissionAccessValue(
      resourceValue.defaultAccess,
      defaultAccess,
    );
    resources[resourceType] = {
      defaultAccess: resourceDefaultAccess,
      rules: normalizePermissionRules(resourceValue.rules, resourceDefaultAccess),
    };
  }

  return {
    version: 1,
    subjectType: normalizedSubjectType,
    defaultAccess,
    rings: normalizePermissionRings(value.rings),
    actions: normalizePermissionActions(value.actions, normalizedSubjectType),
    resources,
  };
}

export function getPlatformPermissionRingDefinitionById(ringId: unknown) {
  const normalizedRingId = normalizePlatformPermissionRingId(ringId, "ring_1");
  return PLATFORM_PERMISSION_RING_DEFINITIONS.find((ring) => ring.id === normalizedRingId)
    || PLATFORM_PERMISSION_RING_DEFINITIONS[0];
}

export function getPlatformPermissionActionDefinitionById(actionId: unknown) {
  const normalizedActionId = String(actionId || "");
  return PLATFORM_PERMISSION_ACTION_DEFINITIONS.find((action) => action.id === normalizedActionId) || null;
}

export function getPlatformPermissionActionRingIdByDefinition(
  permissionSet: PlatformPermissionSet | null | undefined,
  actionDefinition: PlatformPermissionActionDefinition | null | undefined,
): string {
  if (!actionDefinition) return "ring_1";
  const normalizedPermissionSet = normalizePlatformPermissionSet(
    permissionSet,
    normalizePlatformPermissionSubjectType(permissionSet?.subjectType, "agent"),
  );
  return getPlatformPermissionActionRingId(
    normalizedPermissionSet,
    actionDefinition,
    PLATFORM_PERMISSION_RING_DEFINITIONS,
  );
}

export function getPlatformPermissionRingAccessById(
  permissionSet: PlatformPermissionSet | null | undefined,
  ringId: unknown,
): PlatformPermissionAccess {
  const normalizedPermissionSet = normalizePlatformPermissionSet(
    permissionSet,
    normalizePlatformPermissionSubjectType(permissionSet?.subjectType, "agent"),
  );
  const ringDefinition = getPlatformPermissionRingDefinitionById(ringId);
  return getPlatformPermissionRingAccess(
    normalizedPermissionSet,
    ringDefinition,
    PLATFORM_PERMISSION_ACCESS_OPTIONS,
  );
}

export function getPlatformPermissionActionExplicitAccessByDefinition(
  permissionSet: PlatformPermissionSet | null | undefined,
  actionDefinition: PlatformPermissionActionDefinition | string | null | undefined,
): PlatformPermissionAccess | "" {
  const resolvedAction = typeof actionDefinition === "string"
    ? getPlatformPermissionActionDefinitionById(actionDefinition)
    : actionDefinition;
  if (!resolvedAction) return "";
  const subjectType = normalizePlatformPermissionSubjectType(permissionSet?.subjectType, "agent");
  if (!shouldShowPlatformPermissionAction(resolvedAction, subjectType)) return "";
  const normalizedPermissionSet = normalizePlatformPermissionSet(
    permissionSet,
    subjectType,
  );
  return getPlatformPermissionActionExplicitAccess(
    normalizedPermissionSet,
    resolvedAction,
    PLATFORM_PERMISSION_RING_DEFINITIONS,
    PLATFORM_PERMISSION_ACCESS_OPTIONS,
  );
}

export function getPlatformPermissionActionAccessByDefinition(
  permissionSet: PlatformPermissionSet | null | undefined,
  actionDefinition: PlatformPermissionActionDefinition | string | null | undefined,
): PlatformPermissionAccess {
  const resolvedAction = typeof actionDefinition === "string"
    ? getPlatformPermissionActionDefinitionById(actionDefinition)
    : actionDefinition;
  if (!resolvedAction) return "no_access";
  const subjectType = normalizePlatformPermissionSubjectType(permissionSet?.subjectType, "agent");
  if (!shouldShowPlatformPermissionAction(resolvedAction, subjectType)) return "no_access";
  const explicitAccess = getPlatformPermissionActionExplicitAccessByDefinition(
    permissionSet,
    resolvedAction,
  );
  if (explicitAccess) return explicitAccess;
  const ringId = getPlatformPermissionActionRingIdByDefinition(permissionSet, resolvedAction);
  return getPlatformPermissionRingAccessById(permissionSet, ringId);
}

export function buildPlatformPermissionActionPolicy(
  permissionSet: PlatformPermissionSet | null | undefined,
  actionDefinition: PlatformPermissionActionDefinition | string | null | undefined,
  currentActionPolicy: PlatformPermissionActionPolicy = {},
  nextAccess: PlatformPermissionAccess | "" = "",
  nextRingId = "",
): PlatformPermissionActionPolicy {
  const resolvedAction = typeof actionDefinition === "string"
    ? getPlatformPermissionActionDefinitionById(actionDefinition)
    : actionDefinition;
  if (!resolvedAction) return currentActionPolicy;

  const normalizedPermissionSet = normalizePlatformPermissionSet(
    permissionSet,
    normalizePlatformPermissionSubjectType(permissionSet?.subjectType, "agent"),
  );
  const normalizedRingId = normalizePlatformPermissionRingId(
    nextRingId || currentActionPolicy.ringId,
    resolvedAction.ringId,
  );
  const inheritedAccess = getPlatformPermissionRingAccessById(
    normalizedPermissionSet,
    normalizedRingId,
  );
  const normalizedAccess = normalizePlatformPermissionAccessValue(nextAccess, "");
  const nextPolicy: PlatformPermissionActionPolicy = {
    ...currentActionPolicy,
    ringId: normalizedRingId,
  };
  if (normalizedAccess && normalizedAccess !== inheritedAccess) {
    nextPolicy.access = normalizedAccess;
  } else {
    delete nextPolicy.access;
  }
  return nextPolicy;
}

export function updatePlatformPermissionRingAccess(
  permissionSet: PlatformPermissionSet | null | undefined,
  ringId: unknown,
  access: PlatformPermissionAccess,
  subjectType: PlatformPermissionSubjectType = "agent",
): PlatformPermissionSet {
  const normalizedRingId = normalizePlatformPermissionRingId(ringId, "");
  const current = normalizePlatformPermissionSet(permissionSet, subjectType);
  if (!normalizedRingId) return current;
  const currentRings = current.rings || createPlatformDefaultPermissionRings();
  return {
    ...current,
    version: 1,
    subjectType,
    rings: {
      ...currentRings,
      [normalizedRingId]: {
        ...(typeof currentRings[normalizedRingId] === "object" ? currentRings[normalizedRingId] : {}),
        defaultAccess: normalizePlatformPermissionAccessValue(access),
      },
    },
  };
}

export function updatePlatformPermissionActionRing(
  permissionSet: PlatformPermissionSet | null | undefined,
  actionId: unknown,
  ringId: unknown,
  subjectType: PlatformPermissionSubjectType = "agent",
): PlatformPermissionSet {
  const action = getPlatformPermissionActionDefinitionById(actionId);
  const current = normalizePlatformPermissionSet(permissionSet, subjectType);
  if (!action || !shouldShowPlatformPermissionAction(action, subjectType)) return current;
  const currentActions = current.actions || createPlatformDefaultPermissionActions(subjectType);
  const rawPolicy = currentActions[action.id];
  const currentPolicy = typeof rawPolicy === "object" && rawPolicy
    ? rawPolicy
    : { ringId: action.ringId };
  return {
    ...current,
    version: 1,
    subjectType,
    actions: {
      ...currentActions,
      [action.id]: buildPlatformPermissionActionPolicy(
        current,
        action,
        currentPolicy,
        getPlatformPermissionActionExplicitAccessByDefinition(current, action),
        normalizePlatformPermissionRingId(ringId, action.ringId),
      ),
    },
  };
}

export function updatePlatformPermissionActionAccess(
  permissionSet: PlatformPermissionSet | null | undefined,
  actionId: unknown,
  access: PlatformPermissionAccess | "",
  subjectType: PlatformPermissionSubjectType = "agent",
): PlatformPermissionSet {
  const action = getPlatformPermissionActionDefinitionById(actionId);
  const current = normalizePlatformPermissionSet(permissionSet, subjectType);
  if (!action || !shouldShowPlatformPermissionAction(action, subjectType)) return current;
  const currentActions = current.actions || createPlatformDefaultPermissionActions(subjectType);
  const rawPolicy = currentActions[action.id];
  const currentPolicy = typeof rawPolicy === "object" && rawPolicy
    ? rawPolicy
    : { ringId: action.ringId };
  return {
    ...current,
    version: 1,
    subjectType,
    actions: {
      ...currentActions,
      [action.id]: buildPlatformPermissionActionPolicy(
        current,
        action,
        currentPolicy,
        access ? normalizePlatformPermissionAccessValue(access) : "",
      ),
    },
  };
}

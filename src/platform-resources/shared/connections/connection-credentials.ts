export type PlatformConnectionCredentialStatus = "pending" | "valid" | "invalid";

export interface PlatformConnectionCredential {
  id: string;
  name: string;
  identity: string;
  method: string;
  status: PlatformConnectionCredentialStatus;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  lastCheckedAt: string;
}

export interface CreatePlatformConnectionCredentialOptions {
  id?: string;
  name: string;
  identity?: string;
  method?: string;
  status?: PlatformConnectionCredentialStatus;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastCheckedAt?: string;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStatus(value: unknown): PlatformConnectionCredentialStatus {
  return value === "valid" || value === "invalid" ? value : "pending";
}

function createCredentialId(): string {
  const randomId = globalThis.crypto?.randomUUID?.();
  if (randomId) return `credential_${randomId}`;
  return `credential_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createPlatformConnectionCredential(
  options: CreatePlatformConnectionCredentialOptions,
): PlatformConnectionCredential {
  const now = new Date().toISOString();
  const createdAt = asText(options.createdAt) || now;
  return {
    id: asText(options.id) || createCredentialId(),
    name: asText(options.name) || "Connected account",
    identity: asText(options.identity),
    method: asText(options.method) || "OAuth 2.0",
    status: normalizeStatus(options.status),
    isDefault: Boolean(options.isDefault),
    createdAt,
    updatedAt: asText(options.updatedAt) || createdAt,
    lastCheckedAt: asText(options.lastCheckedAt),
  };
}

export function normalizePlatformConnectionCredentials(
  value: unknown,
): PlatformConnectionCredential[] {
  const source = Array.isArray(value) ? value : [];
  const seenIds = new Set<string>();
  const credentials = source.flatMap((item) => {
    const record = asRecord(item);
    if (!record) return [];
    const credential = createPlatformConnectionCredential({
      id: asText(record.id),
      name: asText(record.name) || asText(record.identity),
      identity: asText(record.identity),
      method: asText(record.method),
      status: normalizeStatus(record.status),
      isDefault: Boolean(record.isDefault),
      createdAt: asText(record.createdAt),
      updatedAt: asText(record.updatedAt),
      lastCheckedAt: asText(record.lastCheckedAt),
    });
    if (seenIds.has(credential.id)) return [];
    seenIds.add(credential.id);
    return [credential];
  });

  if (credentials.length === 0) return [];
  const requestedDefaultIndex = credentials.findIndex((credential) => credential.isDefault);
  const defaultIndex = requestedDefaultIndex >= 0 ? requestedDefaultIndex : 0;
  return credentials.map((credential, index) => ({
    ...credential,
    isDefault: index === defaultIndex,
  }));
}

export function upsertPlatformConnectionCredential(
  credentials: unknown,
  nextCredential: PlatformConnectionCredential,
): PlatformConnectionCredential[] {
  const normalized = normalizePlatformConnectionCredentials(credentials);
  const index = normalized.findIndex((credential) => credential.id === nextCredential.id);
  const next = index >= 0
    ? normalized.map((credential, credentialIndex) => (
        credentialIndex === index
          ? createPlatformConnectionCredential({
              ...credential,
              ...nextCredential,
              isDefault: credential.isDefault || nextCredential.isDefault,
            })
          : credential
      ))
    : [
        ...normalized,
        createPlatformConnectionCredential({
          ...nextCredential,
          isDefault: normalized.length === 0 || nextCredential.isDefault,
        }),
      ];
  return normalizePlatformConnectionCredentials(next);
}

export function reconcilePlatformConnectionCredentials(
  configuredCredentials: unknown,
  providerCredentials: unknown,
): PlatformConnectionCredential[] {
  const configured = normalizePlatformConnectionCredentials(configuredCredentials);
  const provider = normalizePlatformConnectionCredentials(providerCredentials);
  if (provider.length === 0) {
    return normalizePlatformConnectionCredentials(
      configured.filter((credential) => credential.status === "pending"),
    );
  }

  const configuredById = new Map(
    configured.map((credential) => [credential.id, credential] as const),
  );
  const reconciled = provider.map((credential) => {
    const configuredCredential = configuredById.get(credential.id);
    return createPlatformConnectionCredential({
      ...credential,
      name: configuredCredential?.name || credential.name,
      isDefault: credential.isDefault,
    });
  });

  for (const credential of configured) {
    if (
      credential.status === "pending"
      && !provider.some((providerCredential) => providerCredential.id === credential.id)
    ) {
      reconciled.push(credential);
    }
  }

  return normalizePlatformConnectionCredentials(reconciled);
}

export function removePlatformConnectionCredential(
  credentials: unknown,
  credentialId: string,
): PlatformConnectionCredential[] {
  const normalizedId = asText(credentialId);
  return normalizePlatformConnectionCredentials(
    normalizePlatformConnectionCredentials(credentials).filter(
      (credential) => credential.id !== normalizedId,
    ),
  );
}

export function finalizePlatformConnectionCredential(
  credentials: unknown,
  credentialId: string,
  options: {
    identity?: string;
    name?: string;
    method?: string;
    lastCheckedAt?: string;
  } = {},
): PlatformConnectionCredential[] {
  const normalizedId = asText(credentialId);
  const now = new Date().toISOString();
  return normalizePlatformConnectionCredentials(credentials).map((credential) => (
    credential.id === normalizedId
      ? {
          ...credential,
          name: asText(options.name) || credential.name,
          identity: asText(options.identity) || credential.identity,
          method: asText(options.method) || credential.method,
          status: "valid",
          updatedAt: now,
          lastCheckedAt: asText(options.lastCheckedAt) || now,
        }
      : credential
  ));
}

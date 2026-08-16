import fs from "node:fs/promises";
import path from "node:path";

import { createExternalAgentId, isRecord } from "./domain.mjs";

const STORE_VERSION = 1;

export function createExternalAgentStore() {
  return {
    version: STORE_VERSION,
    installations: [],
    bindings: [],
    identities: [],
    conversations: [],
    events: [],
    tasks: [],
    deliveries: [],
  };
}

export function createInMemoryExternalAgentRepository(initialStore = undefined) {
  let store = normalizeStore(initialStore || createExternalAgentStore());
  let queue = Promise.resolve();
  return createRepository({
    read: async () => store,
    write: async (nextStore) => {
      store = nextStore;
    },
    enqueue(operation) {
      const result = queue.then(operation);
      queue = result.catch(() => undefined);
      return result;
    },
  });
}

export function createFileExternalAgentRepository({
  storePath,
  legacyStorePaths = [],
  logger = console,
}) {
  const normalizedPath = path.resolve(String(storePath || ""));
  const backupPath = `${normalizedPath}.bak`;
  let cachePromise = null;
  let queue = Promise.resolve();

  async function read() {
    if (!cachePromise) {
      cachePromise = loadStore();
    }
    return cachePromise;
  }

  async function loadStore() {
    const primary = await readStoreFile(normalizedPath);
    if (primary) return primary;

    const backup = await readStoreFile(backupPath);
    if (backup) {
      await persist(backup, { preserveBackup: false });
      logger.warn?.("[external-agents] Restored gateway state from its server-side backup.", {
        path: normalizedPath,
      });
      return backup;
    }

    for (const candidate of legacyStorePaths) {
      const legacyPath = path.resolve(String(candidate || ""));
      if (!legacyPath || legacyPath === normalizedPath) continue;
      const legacy = await readStoreFile(legacyPath);
      if (!legacy) continue;
      await persist(legacy, { preserveBackup: false });
      logger.info?.("[external-agents] Migrated gateway state to durable server storage.", {
        from: legacyPath,
        to: normalizedPath,
      });
      return legacy;
    }

    const empty = createExternalAgentStore();
    await persist(empty, { preserveBackup: false });
    return empty;
  }

  async function write(nextStore) {
    await persist(nextStore);
    cachePromise = Promise.resolve(nextStore);
  }

  async function persist(nextStore, { preserveBackup = true } = {}) {
    await fs.mkdir(path.dirname(normalizedPath), { recursive: true, mode: 0o700 });
    if (preserveBackup) {
      await fs.copyFile(normalizedPath, backupPath).catch((error) => {
        if (error?.code !== "ENOENT") throw error;
      });
      await fs.chmod(backupPath, 0o600).catch((error) => {
        if (error?.code !== "ENOENT") throw error;
      });
    }
    const temporaryPath = `${normalizedPath}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(temporaryPath, `${JSON.stringify(nextStore, null, 2)}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
    await fs.rename(temporaryPath, normalizedPath);
    await fs.chmod(normalizedPath, 0o600);
  }

  return createRepository({
    read,
    write,
    enqueue(operation) {
      const result = queue.then(operation);
      queue = result.catch(() => undefined);
      return result;
    },
  });
}

async function readStoreFile(filePath) {
  try {
    return normalizeStore(JSON.parse(await fs.readFile(filePath, "utf8")));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function createRepository({ read, write, enqueue }) {
  async function snapshot() {
    return structuredClone(await read());
  }

  async function transact(mutator) {
    return enqueue(async () => {
      const current = normalizeStore(await read());
      const draft = structuredClone(current);
      const result = await mutator(draft);
      const normalized = normalizeStore(draft);
      await write(normalized);
      return structuredClone(result);
    });
  }

  async function ingestEvent(envelope, {
    organizationId = "",
    now = new Date().toISOString(),
  } = {}) {
    return transact((store) => {
      const existing = store.events.find((event) => (
        event.envelope?.provider === envelope.provider
        && event.envelope?.installationId === envelope.installationId
        && event.envelope?.eventId === envelope.eventId
      ));
      if (existing) return { duplicate: true, event: existing };
      const event = {
        id: createExternalAgentId("external_event"),
        organizationId: String(organizationId || "").trim(),
        envelope,
        status: "pending",
        attempts: 0,
        receivedAt: now,
        updatedAt: now,
      };
      store.events.push(event);
      return { duplicate: false, event };
    });
  }

  async function claimEvent(now = new Date().toISOString()) {
    return transact((store) => {
      const nowMs = Date.parse(now);
      const event = store.events.find((candidate) => (
        candidate.status === "pending"
        && (!candidate.nextAttemptAt || Date.parse(candidate.nextAttemptAt) <= nowMs)
      ));
      if (!event) return null;
      event.status = "processing";
      event.attempts = Number(event.attempts || 0) + 1;
      event.updatedAt = now;
      return event;
    });
  }

  async function recoverStaleClaims({ before, now = new Date().toISOString() }) {
    return transact((store) => {
      let recovered = 0;
      for (const collectionName of ["events", "deliveries"]) {
        for (const record of store[collectionName]) {
          if (record.status !== "processing") continue;
          if (new Date(record.updatedAt).getTime() >= before) continue;
          record.status = "pending";
          record.nextAttemptAt = now;
          record.updatedAt = now;
          recovered += 1;
        }
      }
      return recovered;
    });
  }

  async function claimDelivery(now = new Date().toISOString()) {
    return transact((store) => {
      const nowMs = Date.parse(now);
      const delivery = store.deliveries.find((candidate) => (
        candidate.status === "pending"
        && (!candidate.nextAttemptAt || Date.parse(candidate.nextAttemptAt) <= nowMs)
      ));
      if (!delivery) return null;
      delivery.status = "processing";
      delivery.attempts = Number(delivery.attempts || 0) + 1;
      delivery.updatedAt = now;
      return delivery;
    });
  }

  return Object.freeze({
    claimDelivery,
    claimEvent,
    ingestEvent,
    recoverStaleClaims,
    snapshot,
    transact,
  });
}

function normalizeStore(value) {
  const source = isRecord(value) ? value : {};
  return {
    version: STORE_VERSION,
    installations: normalizeCollection(source.installations),
    bindings: normalizeCollection(source.bindings),
    identities: normalizeCollection(source.identities),
    conversations: normalizeCollection(source.conversations),
    events: normalizeCollection(source.events),
    tasks: normalizeCollection(source.tasks),
    deliveries: normalizeCollection(source.deliveries),
  };
}

function normalizeCollection(value) {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  createExternalAgentStore,
  createFileExternalAgentRepository,
  createInMemoryExternalAgentRepository,
} from "./repository.mjs";

const envelope = Object.freeze({
  provider: "jira",
  installationId: "installation_jira",
  eventId: "delivery_1",
});

test("event ingestion is idempotent and preserves organization ownership", async () => {
  const repository = createInMemoryExternalAgentRepository();
  const first = await repository.ingestEvent(envelope, { organizationId: "organization_1" });
  const duplicate = await repository.ingestEvent(envelope, { organizationId: "organization_1" });
  const snapshot = await repository.snapshot();

  assert.equal(first.duplicate, false);
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.event.id, first.event.id);
  assert.equal(snapshot.events.length, 1);
  assert.equal(snapshot.events[0].organizationId, "organization_1");
});

test("stale event and delivery claims are recovered durably", async () => {
  const store = createExternalAgentStore();
  store.events.push({ id: "event_1", status: "processing", updatedAt: "2026-01-01T00:00:00.000Z" });
  store.deliveries.push({ id: "delivery_1", status: "processing", updatedAt: "2026-01-01T00:00:00.000Z" });
  const repository = createInMemoryExternalAgentRepository(store);

  const recovered = await repository.recoverStaleClaims({
    before: Date.parse("2026-01-02T00:00:00.000Z"),
    now: "2026-01-02T00:00:01.000Z",
  });
  const snapshot = await repository.snapshot();

  assert.equal(recovered, 2);
  assert.equal(snapshot.events[0].status, "pending");
  assert.equal(snapshot.deliveries[0].status, "pending");
  assert.equal(snapshot.events[0].nextAttemptAt, "2026-01-02T00:00:01.000Z");
});

test("the file repository persists atomically across repository instances", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "external-agent-store-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const storePath = path.join(root, "external-agents.json");
  const firstRepository = createFileExternalAgentRepository({ storePath });
  await firstRepository.ingestEvent(envelope, { organizationId: "organization_1" });

  const secondRepository = createFileExternalAgentRepository({ storePath });
  const snapshot = await secondRepository.snapshot();

  assert.equal(snapshot.events.length, 1);
  assert.equal(snapshot.events[0].organizationId, "organization_1");
  assert.equal((await fs.stat(storePath)).mode & 0o777, 0o600);
});

test("the file repository initializes durable state and migrates a legacy checkout store", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "external-agent-migration-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const legacyPath = path.join(root, "release", ".platform-data", "external-agents.json");
  const durablePath = path.join(root, "server-state", "external-agents.json");
  await fs.mkdir(path.dirname(legacyPath), { recursive: true });
  await fs.writeFile(legacyPath, JSON.stringify({
    ...createExternalAgentStore(),
    installations: [{ id: "installation_jira", organizationId: "organization_1" }],
  }));

  const repository = createFileExternalAgentRepository({
    storePath: durablePath,
    legacyStorePaths: [legacyPath],
    logger: { info() {}, warn() {} },
  });
  const snapshot = await repository.snapshot();

  assert.equal(snapshot.installations.length, 1);
  assert.equal(snapshot.installations[0].id, "installation_jira");
  assert.equal((await fs.stat(durablePath)).mode & 0o777, 0o600);
});

test("the file repository restores a missing primary store from its backup", async (t) => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "external-agent-backup-"));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const storePath = path.join(root, "external-agents.json");
  const first = createFileExternalAgentRepository({ storePath });
  await first.ingestEvent(envelope, { organizationId: "organization_1" });
  await first.transact((store) => {
    store.installations.push({ id: "installation_jira", organizationId: "organization_1" });
  });
  await fs.rm(storePath);

  const restored = createFileExternalAgentRepository({
    storePath,
    logger: { info() {}, warn() {} },
  });
  const snapshot = await restored.snapshot();

  assert.equal(snapshot.events.length, 1);
  assert.equal(await fs.readFile(storePath, "utf8").then(Boolean), true);
});

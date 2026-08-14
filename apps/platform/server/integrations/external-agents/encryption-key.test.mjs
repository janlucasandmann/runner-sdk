import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { resolveExternalAgentEncryptionKey } from "./encryption-key.mjs";

test("local development generates and reuses a private webhook encryption key", (t) => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "external-agent-key-"));
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }));
  const options = {
    cwd,
    env: {},
    platformOrigin: "http://localhost:4177",
    logger: { info() {} },
  };

  const first = resolveExternalAgentEncryptionKey(options);
  const second = resolveExternalAgentEncryptionKey(options);
  const keyPath = path.join(cwd, ".platform-data", "external-agent-webhook.key");

  assert.equal(first, second);
  assert.ok(Buffer.byteLength(first, "utf8") >= 32);
  assert.equal(fs.statSync(keyPath).mode & 0o777, 0o600);
});

test("appliance deployments persist the generated key under PLATFORM_DATA_ROOT", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "external-agent-data-root-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const dataRoot = path.join(root, "platform-state");
  const value = resolveExternalAgentEncryptionKey({
    cwd: path.join(root, "immutable-release"),
    env: { PLATFORM_DATA_ROOT: dataRoot },
    platformOrigin: "http://127.0.0.1:4177",
    logger: { info() {} },
  });

  assert.ok(value);
  assert.equal(
    fs.readFileSync(path.join(dataRoot, "external-agent-webhook.key"), "utf8").trim(),
    value,
  );
});

test("hosted deployments remain fail-closed without an explicit key", () => {
  assert.equal(resolveExternalAgentEncryptionKey({
    env: {},
    platformOrigin: "https://platform.example.com",
  }), "");
});

test("an explicit key wins in every environment", () => {
  assert.equal(resolveExternalAgentEncryptionKey({
    encryptionKey: "explicit-production-encryption-key-value",
    env: {},
    platformOrigin: "https://platform.example.com",
  }), "explicit-production-encryption-key-value");
});

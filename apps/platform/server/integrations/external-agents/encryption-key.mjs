import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

const MINIMUM_KEY_BYTES = 32;
const LOCAL_KEY_FILENAME = "external-agent-webhook.key";

export function resolveExternalAgentEncryptionKey({
  encryptionKey = "",
  platformOrigin = "",
  env = process.env,
  cwd = process.cwd(),
  dataRoot = "",
  legacyKeyPaths = [],
  logger = console,
} = {}) {
  const configured = String(
    encryptionKey || env.EXTERNAL_AGENT_WEBHOOK_ENCRYPTION_KEY || "",
  ).trim();
  if (configured) return configured;
  if (!isLoopbackOrigin(platformOrigin)) return "";

  const keyPath = path.resolve(
    String(env.EXTERNAL_AGENT_LOCAL_ENCRYPTION_KEY_PATH || "").trim()
      || (String(env.PLATFORM_DATA_ROOT || "").trim()
        ? path.join(String(env.PLATFORM_DATA_ROOT).trim(), LOCAL_KEY_FILENAME)
        : dataRoot
          ? path.join(dataRoot, LOCAL_KEY_FILENAME)
          : path.join(cwd, ".platform-data", LOCAL_KEY_FILENAME)),
  );
  const existing = readKey(keyPath);
  if (existing) return existing;

  const migrated = migrateLegacyKey({ keyPath, legacyKeyPaths, logger });
  if (migrated) return migrated;

  fs.mkdirSync(path.dirname(keyPath), { recursive: true, mode: 0o700 });
  const generated = randomBytes(MINIMUM_KEY_BYTES).toString("base64url");
  try {
    fs.writeFileSync(keyPath, `${generated}\n`, {
      encoding: "utf8",
      flag: "wx",
      mode: 0o600,
    });
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
    const concurrent = readKey(keyPath);
    if (concurrent) return concurrent;
    throw error;
  }
  fs.chmodSync(keyPath, 0o600);
  logger.info?.("[external-agents] Generated a persistent local webhook encryption key.", {
    path: keyPath,
  });
  return generated;
}

function migrateLegacyKey({ keyPath, legacyKeyPaths, logger }) {
  for (const candidate of legacyKeyPaths) {
    const legacyPath = path.resolve(String(candidate || ""));
    if (!legacyPath || legacyPath === keyPath) continue;
    const value = readKey(legacyPath);
    if (!value) continue;
    fs.mkdirSync(path.dirname(keyPath), { recursive: true, mode: 0o700 });
    try {
      fs.writeFileSync(keyPath, `${value}\n`, {
        encoding: "utf8",
        flag: "wx",
        mode: 0o600,
      });
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
    }
    const current = readKey(keyPath);
    if (!current) continue;
    logger.info?.("[external-agents] Migrated the webhook encryption key to durable server state.", {
      from: legacyPath,
      to: keyPath,
    });
    return current;
  }
  return "";
}

function readKey(keyPath) {
  try {
    const value = fs.readFileSync(keyPath, "utf8").trim();
    if (Buffer.byteLength(value, "utf8") < MINIMUM_KEY_BYTES) {
      throw new Error(
        `External-agent local webhook key at ${keyPath} must contain at least ${MINIMUM_KEY_BYTES} bytes.`,
      );
    }
    fs.chmodSync(keyPath, 0o600);
    return value;
  } catch (error) {
    if (error?.code === "ENOENT") return "";
    throw error;
  }
}

function isLoopbackOrigin(value) {
  try {
    const hostname = new URL(String(value || "")).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

import { createHash, randomBytes } from "node:crypto";
import { mkdir, open, readFile, rename, unlink } from "node:fs/promises";
import path from "node:path";

const STATE_VERSION = 1;

function digest(value) {
  return createHash("sha256").update(String(value || ""), "utf8").digest("hex");
}

function identityDigest(email, userId) {
  return digest(`${String(email || "").trim().toLowerCase()}\0${String(userId || "").trim()}`);
}

function emptyState() {
  return { version: STATE_VERSION, tokens: {} };
}

function normalizeState(value) {
  if (value?.version !== STATE_VERSION || !value.tokens || typeof value.tokens !== "object") {
    throw new Error("Password reset token state is invalid.");
  }
  return {
    version: STATE_VERSION,
    tokens: Object.fromEntries(
      Object.entries(value.tokens).filter(([, record]) => (
        record
        && typeof record === "object"
        && typeof record.identity === "string"
        && Number.isFinite(record.expiresAt)
      )),
    ),
  };
}

function createMemoryStore(clock) {
  const tokens = new Map();

  function prune() {
    const now = clock();
    for (const [token, record] of tokens) {
      if (record.expiresAt <= now) tokens.delete(token);
    }
  }

  return Object.freeze({
    async register({ nonce, email, userId, expiresAt }) {
      prune();
      tokens.set(digest(nonce), {
        identity: identityDigest(email, userId),
        expiresAt,
      });
    },
    async has({ nonce, email, userId }) {
      prune();
      const record = tokens.get(digest(nonce));
      return record?.identity === identityDigest(email, userId);
    },
    async consume({ nonce, email, userId }) {
      prune();
      const key = digest(nonce);
      const record = tokens.get(key);
      if (record?.identity !== identityDigest(email, userId)) return false;
      tokens.delete(key);
      return true;
    },
    async remove(nonce) {
      tokens.delete(digest(nonce));
    },
    async revokeIdentity(email, userId) {
      const identity = identityDigest(email, userId);
      for (const [token, record] of tokens) {
        if (record.identity === identity) tokens.delete(token);
      }
    },
  });
}

export function createPasswordResetTokenStore({ filePath = "", clock = Date.now } = {}) {
  const resolvedPath = String(filePath || "").trim();
  if (!resolvedPath) return createMemoryStore(clock);
  if (!path.isAbsolute(resolvedPath)) {
    throw new Error("Password reset token state path must be absolute.");
  }

  let mutation = Promise.resolve();

  async function readState() {
    try {
      return normalizeState(JSON.parse(await readFile(resolvedPath, "utf8")));
    } catch (error) {
      if (error?.code === "ENOENT") return emptyState();
      throw error;
    }
  }

  function prune(state) {
    const now = clock();
    for (const [token, record] of Object.entries(state.tokens)) {
      if (record.expiresAt <= now) delete state.tokens[token];
    }
    return state;
  }

  async function writeState(state) {
    const directory = path.dirname(resolvedPath);
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const temporaryPath = path.join(
      directory,
      `.${path.basename(resolvedPath)}.${process.pid}.${randomBytes(8).toString("hex")}.tmp`,
    );
    const handle = await open(temporaryPath, "wx", 0o600);
    try {
      await handle.writeFile(`${JSON.stringify(state)}\n`, "utf8");
      await handle.sync();
    } finally {
      await handle.close();
    }
    try {
      await rename(temporaryPath, resolvedPath);
    } catch (error) {
      await unlink(temporaryPath).catch(() => {});
      throw error;
    }
  }

  function mutate(operation) {
    const next = mutation.then(async () => {
      const state = prune(await readState());
      const result = await operation(state);
      await writeState(state);
      return result;
    });
    mutation = next.catch(() => {});
    return next;
  }

  async function inspect(operation) {
    await mutation;
    return operation(prune(await readState()));
  }

  return Object.freeze({
    register({ nonce, email, userId, expiresAt }) {
      return mutate((state) => {
        state.tokens[digest(nonce)] = {
          identity: identityDigest(email, userId),
          expiresAt,
        };
      });
    },
    has({ nonce, email, userId }) {
      return inspect((state) => (
        state.tokens[digest(nonce)]?.identity === identityDigest(email, userId)
      ));
    },
    consume({ nonce, email, userId }) {
      return mutate((state) => {
        const key = digest(nonce);
        if (state.tokens[key]?.identity !== identityDigest(email, userId)) return false;
        delete state.tokens[key];
        return true;
      });
    },
    remove(nonce) {
      return mutate((state) => {
        delete state.tokens[digest(nonce)];
      });
    },
    revokeIdentity(email, userId) {
      return mutate((state) => {
        const identity = identityDigest(email, userId);
        for (const [token, record] of Object.entries(state.tokens)) {
          if (record.identity === identity) delete state.tokens[token];
        }
      });
    },
  });
}

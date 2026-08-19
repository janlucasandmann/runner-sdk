import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import bcrypt from "bcryptjs";

const moduleRoot = path.dirname(fileURLToPath(import.meta.url));
const protoPath = path.join(moduleRoot, "dex-api.proto");
const packageDefinition = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const dexApi = grpc.loadPackageDefinition(packageDefinition).api;

function createPassword(client, request, deadlineMs) {
  return new Promise((resolve, reject) => {
    client.createPassword(
      request,
      { deadline: Date.now() + deadlineMs },
      (error, response) => {
        if (error) reject(error);
        else resolve(response);
      },
    );
  });
}

function listPasswords(client, deadlineMs) {
  return new Promise((resolve, reject) => {
    client.listPasswords(
      {},
      { deadline: Date.now() + deadlineMs },
      (error, response) => {
        if (error) reject(error);
        else resolve(response);
      },
    );
  });
}

function updatePassword(client, request, deadlineMs) {
  return new Promise((resolve, reject) => {
    client.updatePassword(
      request,
      { deadline: Date.now() + deadlineMs },
      (error, response) => {
        if (error) reject(error);
        else resolve(response);
      },
    );
  });
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function passwordFingerprint(hash) {
  return createHash("sha256").update(hash).digest("hex");
}

function normalizeDexPassword(password) {
  if (!password) return null;
  const email = normalizeEmail(password.email);
  const hash = Buffer.isBuffer(password.hash)
    ? password.hash
    : Buffer.from(password.hash || "");
  const userId = String(password.user_id || "").trim();
  if (!email || !userId) return null;
  return Object.freeze({
    email,
    displayName: String(password.username || "").trim(),
    userId,
    hash,
    // Dex deliberately omits credential hashes from ListPasswords responses.
    // Hashes remain available for records created in this process, but account
    // discovery and password reset must also work with the public metadata.
    fingerprint: hash.length > 0 ? passwordFingerprint(hash) : "",
  });
}

function normalizeProvisionedAccount({
  email,
  displayName,
  userId,
  passwordHash,
}) {
  const normalized = {
    email: String(email || "").trim().toLowerCase(),
    displayName: String(displayName || "").trim(),
    userId: String(userId || "").trim(),
    passwordHash: String(passwordHash || "").trim(),
  };
  if (!normalized.email || !normalized.email.includes("@")) {
    throw new TypeError("Dex account email is invalid.");
  }
  if (!normalized.displayName || normalized.displayName.length > 256) {
    throw new TypeError("Dex account display name is invalid.");
  }
  if (!normalized.userId || normalized.userId.length > 512) {
    throw new TypeError("Dex account user ID is invalid.");
  }
  if (!/^\$2[aby]\$\d{2}\$/.test(normalized.passwordHash)) {
    throw new TypeError("Dex account password hash must be bcrypt.");
  }
  return normalized;
}

function encodeUnsignedVarint(value) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new TypeError("Dex subject field length must be a non-negative integer.");
  }
  const bytes = [];
  let remaining = value;
  do {
    let byte = remaining & 0x7f;
    remaining = Math.floor(remaining / 128);
    if (remaining > 0) byte |= 0x80;
    bytes.push(byte);
  } while (remaining > 0);
  return Buffer.from(bytes);
}

function encodeProtobufString(fieldNumber, value) {
  const content = Buffer.from(value, "utf8");
  return Buffer.concat([
    Buffer.from([(fieldNumber << 3) | 2]),
    encodeUnsignedVarint(content.length),
    content,
  ]);
}

export function createDexLocalSubject(userId, connectorId = "local") {
  const normalizedUserId = String(userId || "").trim();
  const normalizedConnectorId = String(connectorId || "").trim();
  if (!normalizedUserId || normalizedUserId.length > 512) {
    throw new TypeError("Dex local user ID must contain between 1 and 512 characters.");
  }
  if (!normalizedConnectorId || normalizedConnectorId.length > 128) {
    throw new TypeError("Dex connector ID must contain between 1 and 128 characters.");
  }
  return Buffer.concat([
    encodeProtobufString(1, normalizedUserId),
    encodeProtobufString(2, normalizedConnectorId),
  ]).toString("base64url");
}

export function createDexLocalAccountService(config, dependencies = {}) {
  if (!config?.enabled) return null;
  const client = dependencies.client || new dexApi.Dex(
    config.grpcAddress,
    grpc.credentials.createInsecure(),
  );
  const hashPassword = dependencies.hashPassword
    || ((password) => bcrypt.hash(password, 12));
  const createUserId = dependencies.createUserId || randomUUID;
  const clock = dependencies.clock || Date.now;
  const accountCacheTtlMs = dependencies.accountCacheTtlMs ?? 30_000;
  const accountLocks = new Map();
  const accountCache = new Map();

  async function withAccountLock(email, operation) {
    const key = normalizeEmail(email);
    const previous = accountLocks.get(key) || Promise.resolve();
    let release;
    const current = new Promise((resolve) => { release = resolve; });
    accountLocks.set(key, current);
    await previous;
    try {
      return await operation();
    } finally {
      release();
      if (accountLocks.get(key) === current) accountLocks.delete(key);
    }
  }

  async function findAccount(email, { fresh = false } = {}) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return null;
    const cached = accountCache.get(normalizedEmail);
    if (!fresh && cached?.expiresAt > clock()) return cached.account;
    const response = await listPasswords(client, 7_500);
    for (const password of response?.passwords || []) {
      const normalized = normalizeDexPassword(password);
      if (normalized?.email === normalizedEmail) {
        accountCache.set(normalizedEmail, {
          account: normalized,
          expiresAt: clock() + accountCacheTtlMs,
        });
        return normalized;
      }
    }
    accountCache.set(normalizedEmail, {
      account: null,
      expiresAt: clock() + accountCacheTtlMs,
    });
    return null;
  }

  async function provisionAccount(account) {
    const normalized = normalizeProvisionedAccount(account);
    const response = await createPassword(client, {
      password: {
        email: normalized.email,
        hash: Buffer.from(normalized.passwordHash, "utf8"),
        username: normalized.displayName,
        user_id: normalized.userId,
      },
    }, 7_500);
    return Object.freeze({
      created: !response?.already_exists,
      alreadyExists: Boolean(response?.already_exists),
      subject: createDexLocalSubject(normalized.userId),
    });
  }

  return Object.freeze({
    async createAccount({ email, displayName, password }) {
      const userId = createUserId();
      const passwordHash = await hashPassword(password);
      const response = await createPassword(client, {
        password: {
          email,
          hash: Buffer.from(passwordHash, "utf8"),
          username: displayName,
          user_id: userId,
        },
      }, 7_500);
      const created = !response?.already_exists;
      if (created) {
        accountCache.set(normalizeEmail(email), {
          account: normalizeDexPassword({
            email,
            hash: Buffer.from(passwordHash, "utf8"),
            username: displayName,
            user_id: userId,
          }),
          expiresAt: clock() + accountCacheTtlMs,
        });
      } else {
        accountCache.delete(normalizeEmail(email));
      }
      return Object.freeze({
        created,
        alreadyExists: Boolean(response?.already_exists),
        subject: created ? createDexLocalSubject(userId) : "",
        passwordFingerprint: created
          ? passwordFingerprint(Buffer.from(passwordHash, "utf8"))
          : "",
      });
    },
    async findAccount(email) {
      const account = await findAccount(email);
      if (!account) return null;
      return Object.freeze({
        email: account.email,
        displayName: account.displayName,
        userId: account.userId,
        passwordFingerprint: account.fingerprint,
      });
    },
    async resetPassword({
      email,
      password,
      expectedFingerprint = "",
      expectedUserId,
    }) {
      return withAccountLock(email, async () => {
        const account = await findAccount(email, { fresh: true });
        const normalizedExpectedUserId = String(expectedUserId || "").trim();
        if (
          !account
          || !normalizedExpectedUserId
          || account.userId !== normalizedExpectedUserId
          || (
            expectedFingerprint
            && account.fingerprint
            && account.fingerprint !== expectedFingerprint
          )
        ) {
          return Object.freeze({ updated: false, invalidated: true });
        }
        const nextHash = await hashPassword(password);
        const response = await updatePassword(client, {
          email: account.email,
          new_hash: Buffer.from(nextHash, "utf8"),
          new_username: account.displayName,
        }, 7_500);
        if (response?.not_found) {
          accountCache.delete(account.email);
          return Object.freeze({ updated: false, invalidated: true });
        }
        const normalizedUpdatedAccount = normalizeDexPassword({
          email: account.email,
          hash: Buffer.from(nextHash, "utf8"),
          username: account.displayName,
          user_id: account.userId,
        });
        accountCache.set(account.email, {
          account: normalizedUpdatedAccount,
          expiresAt: clock() + accountCacheTtlMs,
        });
        return Object.freeze({
          updated: true,
          invalidated: false,
          passwordFingerprint: passwordFingerprint(
            Buffer.from(nextHash, "utf8"),
          ),
        });
      });
    },
    provisionAccount,
    close() {
      if (typeof client.close === "function") client.close();
    },
  });
}

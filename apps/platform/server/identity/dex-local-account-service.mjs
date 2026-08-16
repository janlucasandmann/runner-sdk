import { randomUUID } from "node:crypto";
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
      return Object.freeze({
        created,
        alreadyExists: Boolean(response?.already_exists),
        subject: created ? createDexLocalSubject(userId) : "",
      });
    },
    provisionAccount,
    close() {
      if (typeof client.close === "function") client.close();
    },
  });
}

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const PROMPTS_PATH = "/api/real/prompts";
const STORE_VERSION = 1;

function normalizeString(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function encodeId(value) {
  return encodeURIComponent(normalizeString(value));
}

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "").slice(0, 20)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readOrganizationId(req) {
  const headers = req?.headers || {};
  return normalizeString(
    headers["x-computer-agents-organization"]
      || headers["x-runner-organization-id"]
      || headers["x-organization-id"]
      || headers["x-user-id"],
    "default",
  );
}

function readUserIdentity(req) {
  const headers = req?.headers || {};
  return {
    id: normalizeString(
      headers["x-runner-user-id"] || headers["x-user-id"] || headers["x-user-uid"],
    ),
    name: normalizeString(
      headers["x-runner-user-name"] || headers["x-user-name"],
      "You",
    ),
    email: normalizeString(
      headers["x-runner-user-email"] || headers["x-user-email"] || headers["x-user-mail"],
    ),
    avatarUrl: normalizeString(
      headers["x-runner-user-avatar-url"] || headers["x-user-avatar-url"],
    ),
  };
}

function emptyStore() {
  return { version: STORE_VERSION, organizations: {} };
}

function normalizeStore(value) {
  if (!value || typeof value !== "object") return emptyStore();
  const organizations = value.organizations && typeof value.organizations === "object"
    ? value.organizations
    : {};
  return { version: STORE_VERSION, organizations };
}

function normalizeVersion(value, fallbackNumber = 1) {
  const rawNumber = Number(value?.number ?? value?.versionNumber ?? fallbackNumber);
  const createdAt = normalizeString(value?.createdAt, new Date().toISOString());
  const status = normalizeString(value?.status, "saved").toLowerCase();
  return {
    id: normalizeString(value?.id, createId("prompt_version")),
    number: Number.isFinite(rawNumber) && rawNumber > 0 ? Math.floor(rawNumber) : fallbackNumber,
    name: normalizeString(value?.name, "new-prompt"),
    description: String(value?.description ?? ""),
    markdown: String(value?.markdown ?? ""),
    status: status === "published" ? "published" : "saved",
    publishedAt: status === "published" ? normalizeString(value?.publishedAt, createdAt) : "",
    createdAt,
    updatedAt: normalizeString(value?.updatedAt, createdAt),
  };
}

function normalizeOptionalRecord(value, fallback = {}) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? clone(value)
    : fallback;
}

function normalizePrompt(value) {
  const versions = Array.isArray(value?.versions)
    ? value.versions.map((version, index) => normalizeVersion(version, index + 1))
    : [];
  const currentVersion = versions.find(
    (version) => version.id === value?.currentVersionId,
  ) || versions.at(-1) || normalizeVersion({
    name: value?.name,
    description: value?.description,
    markdown: value?.markdown,
  }, 1);
  if (!versions.length) versions.push(currentVersion);
  const metadata = normalizeOptionalRecord(value?.metadata);
  const creator = normalizeOptionalRecord(value?.creator || metadata.creator);
  const owner = normalizeOptionalRecord(value?.owner || metadata.owner);
  return {
    id: normalizeString(value?.id, createId("prompt")),
    name: normalizeString(value?.name, currentVersion.name || "new-prompt"),
    description: String(value?.description ?? currentVersion.description ?? ""),
    creatorId: normalizeString(
      creator.id || creator.userId || value?.creatorId || value?.creatorUserId,
    ),
    creatorEmail: normalizeString(creator.email || value?.creatorEmail),
    creatorName: normalizeString(creator.name || value?.creatorName, "You"),
    creatorAvatarUrl: normalizeString(creator.avatarUrl || value?.creatorAvatarUrl),
    ownerId: normalizeString(
      owner.id || owner.userId || value?.ownerId || value?.ownerUserId,
    ),
    ownerEmail: normalizeString(owner.email || value?.ownerEmail),
    ownerName: normalizeString(owner.name || value?.ownerName),
    ownerAvatarUrl: normalizeString(owner.avatarUrl || value?.ownerAvatarUrl),
    createdAt: normalizeString(value?.createdAt, currentVersion.createdAt),
    updatedAt: normalizeString(value?.updatedAt, currentVersion.createdAt),
    currentVersionId: currentVersion.id,
    currentVersionNumber: currentVersion.number,
    publishedVersionId: normalizeString(value?.publishedVersionId),
    markdown: currentVersion.markdown,
    metadata,
    permissionSet: normalizeOptionalRecord(value?.permissionSet, null),
    versions,
  };
}

function summarizePrompt(prompt) {
  const normalized = normalizePrompt(prompt);
  return {
    id: normalized.id,
    name: normalized.name,
    description: normalized.description,
    creatorName: normalized.creatorName,
    creatorId: normalized.creatorId,
    creatorEmail: normalized.creatorEmail,
    creatorAvatarUrl: normalized.creatorAvatarUrl,
    ownerId: normalized.ownerId,
    ownerEmail: normalized.ownerEmail,
    ownerName: normalized.ownerName,
    ownerAvatarUrl: normalized.ownerAvatarUrl,
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
    currentVersionId: normalized.currentVersionId,
    currentVersionNumber: normalized.currentVersionNumber,
    publishedVersionId: normalized.publishedVersionId,
    metadata: clone(normalized.metadata),
    permissionSet: normalized.permissionSet ? clone(normalized.permissionSet) : null,
  };
}

function readPromptBody(body) {
  const payload = body && typeof body === "object" ? body : {};
  return {
    name: normalizeString(payload.name, "new-prompt"),
    description: String(payload.description ?? ""),
    markdown: String(payload.markdown ?? payload.content ?? ""),
    metadata: normalizeOptionalRecord(payload.metadata),
    permissionSet: normalizeOptionalRecord(payload.permissionSet, null),
  };
}

export function createPromptsService(adapters = {}) {
  if (typeof adapters.readRequestBody !== "function") {
    throw new TypeError("Prompts service requires the readRequestBody adapter.");
  }
  if (typeof adapters.sendJson !== "function") {
    throw new TypeError("Prompts service requires the sendJson adapter.");
  }

  const storePath = String(
    adapters.storePath
      || process.env.PLATFORM_PROMPTS_STORE_PATH
      || path.join(process.cwd(), ".platform-data", "prompts.json"),
  );
  let storePromise = null;
  let writeQueue = Promise.resolve();

  async function readStore() {
    if (!storePromise) {
      storePromise = fs.readFile(storePath, "utf8")
        .then((content) => normalizeStore(JSON.parse(content)))
        .catch((error) => {
          if (error?.code !== "ENOENT") throw error;
          return emptyStore();
        });
    }
    return storePromise;
  }

  function withWriteLock(callback) {
    const operation = writeQueue.then(async () => {
      const store = await readStore();
      const result = await callback(store);
      await fs.mkdir(path.dirname(storePath), { recursive: true });
      const temporaryPath = `${storePath}.${process.pid}.${Date.now()}.tmp`;
      await fs.writeFile(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
      await fs.rename(temporaryPath, storePath);
      storePromise = Promise.resolve(store);
      return result;
    });
    writeQueue = operation.catch(() => undefined);
    return operation;
  }

  function getOrganizationPrompts(store, organizationId) {
    const existing = Array.isArray(store.organizations[organizationId])
      ? store.organizations[organizationId]
      : [];
    store.organizations[organizationId] = existing;
    return existing;
  }

  function findPrompt(store, organizationId, promptId) {
    return getOrganizationPrompts(store, organizationId).find(
      (prompt) => String(prompt?.id || "") === promptId,
    ) || null;
  }

  async function handle(req, res, url) {
    const suffix = url.pathname.slice(PROMPTS_PATH.length).replace(/^\/+|\/+$/g, "");
    const parts = suffix ? suffix.split("/").filter(Boolean).map(decodeURIComponent) : [];
    const organizationId = readOrganizationId(req);
    const method = String(req.method || "GET").toUpperCase();

    if (parts.length === 0 && method === "GET") {
      const store = await readStore();
      const prompts = getOrganizationPrompts(store, organizationId).map(summarizePrompt);
      adapters.sendJson(res, 200, { object: "list", data: prompts, prompts });
      return;
    }

    if (parts.length === 0 && method === "POST") {
      const body = readPromptBody(await adapters.readRequestBody(req));
      const identity = readUserIdentity(req);
      const metadataCreator = normalizeOptionalRecord(body.metadata?.creator);
      const creatorIdentity = identity.name !== "You"
        ? identity
        : {
            id: normalizeString(metadataCreator.id || metadataCreator.userId),
            name: normalizeString(metadataCreator.name, "You"),
            email: normalizeString(metadataCreator.email),
            avatarUrl: normalizeString(metadataCreator.avatarUrl),
          };
      const now = new Date().toISOString();
      const version = normalizeVersion({ ...body, number: 1 }, 1);
      const prompt = normalizePrompt({
        ...body,
        id: createId("prompt"),
        creatorId: creatorIdentity.id,
        creatorName: creatorIdentity.name,
        creatorEmail: creatorIdentity.email,
        creatorAvatarUrl: creatorIdentity.avatarUrl,
        createdAt: now,
        updatedAt: now,
        currentVersionId: version.id,
        versions: [version],
      });
      await withWriteLock((store) => {
        getOrganizationPrompts(store, organizationId).push(prompt);
      });
      adapters.sendJson(res, 201, { prompt: clone(prompt), version: clone(version) });
      return;
    }

    if (parts.length < 1) {
      adapters.sendJson(res, 404, { error: "Prompt not found." });
      return;
    }

    const promptId = parts[0];
    if (parts.length === 1 && method === "GET") {
      const store = await readStore();
      const prompt = findPrompt(store, organizationId, promptId);
      if (!prompt) {
        adapters.sendJson(res, 404, { error: "Prompt not found." });
        return;
      }
      adapters.sendJson(res, 200, { prompt: clone(normalizePrompt(prompt)) });
      return;
    }

    if (parts.length === 1 && method === "PATCH") {
      const payload = await adapters.readRequestBody(req);
      const result = await withWriteLock((store) => {
        const prompt = findPrompt(store, organizationId, promptId);
        if (!prompt) return null;
        let normalizedPrompt = normalizePrompt(prompt);
        if (payload && typeof payload === "object" && !Array.isArray(payload)) {
          if (Object.prototype.hasOwnProperty.call(payload, "metadata")) {
            normalizedPrompt.metadata = normalizeOptionalRecord(payload.metadata);
          }
          if (Object.prototype.hasOwnProperty.call(payload, "permissionSet")) {
            normalizedPrompt.permissionSet = normalizeOptionalRecord(payload.permissionSet, null);
          }
          if (Object.prototype.hasOwnProperty.call(payload, "name")) {
            const name = normalizeString(payload.name);
            if (name) normalizedPrompt.name = name;
          }
          if (Object.prototype.hasOwnProperty.call(payload, "description")) {
            normalizedPrompt.description = String(payload.description ?? "");
          }
        }
        // Re-project identity aliases after metadata changes (for example an
        // ownership transfer) so detail and overview payloads stay in sync.
        normalizedPrompt = normalizePrompt(normalizedPrompt);
        normalizedPrompt.updatedAt = new Date().toISOString();
        const prompts = getOrganizationPrompts(store, organizationId);
        const index = prompts.findIndex((entry) => String(entry?.id || "") === promptId);
        prompts[index] = normalizedPrompt;
        return { prompt: clone(normalizedPrompt) };
      });
      if (!result) {
        adapters.sendJson(res, 404, { error: "Prompt not found." });
        return;
      }
      adapters.sendJson(res, 200, result);
      return;
    }

    if (parts.length === 4 && parts[1] === "versions" && parts[3] === "publish" && (method === "POST" || method === "PATCH")) {
      const versionId = normalizeString(parts[2]);
      const result = await withWriteLock((store) => {
        const prompt = findPrompt(store, organizationId, promptId);
        if (!prompt) return { kind: "missing-prompt" };
        const normalizedPrompt = normalizePrompt(prompt);
        const targetVersion = normalizedPrompt.versions.find(
          (version) => String(version?.id || "") === versionId,
        );
        if (!targetVersion) return { kind: "missing-version" };
        const now = new Date().toISOString();
        normalizedPrompt.versions = normalizedPrompt.versions.map((version) =>
          String(version?.id || "") === versionId
            ? { ...version, status: "published", publishedAt: now, updatedAt: now }
            : { ...version, status: "saved", publishedAt: "" },
        );
        normalizedPrompt.publishedVersionId = versionId;
        normalizedPrompt.updatedAt = now;
        const publishedVersion = normalizedPrompt.versions.find(
          (version) => String(version?.id || "") === versionId,
        );
        const prompts = getOrganizationPrompts(store, organizationId);
        const index = prompts.findIndex((entry) => String(entry?.id || "") === promptId);
        prompts[index] = normalizedPrompt;
        return {
          prompt: clone(normalizedPrompt),
          version: clone(publishedVersion),
          publishedVersionId: versionId,
        };
      });
      if (result?.kind === "missing-prompt") {
        adapters.sendJson(res, 404, { error: "Prompt not found." });
        return;
      }
      if (result?.kind === "missing-version") {
        adapters.sendJson(res, 404, { error: "Prompt version not found." });
        return;
      }
      adapters.sendJson(res, 200, result);
      return;
    }

    if (parts.length === 1 && method === "DELETE") {
      const deleted = await withWriteLock((store) => {
        const prompts = getOrganizationPrompts(store, organizationId);
        const index = prompts.findIndex((prompt) => String(prompt?.id || "") === promptId);
        if (index < 0) return false;
        prompts.splice(index, 1);
        return true;
      });
      if (!deleted) {
        adapters.sendJson(res, 404, { error: "Prompt not found." });
        return;
      }
      adapters.sendJson(res, 200, { deleted: true, id: promptId });
      return;
    }

    if (parts.length === 2 && parts[1] === "versions" && method === "POST") {
      const body = readPromptBody(await adapters.readRequestBody(req));
      const result = await withWriteLock((store) => {
        const prompt = findPrompt(store, organizationId, promptId);
        if (!prompt) return null;
        const normalizedPrompt = normalizePrompt(prompt);
        const nextNumber = normalizedPrompt.versions.reduce(
          (highest, version) => Math.max(highest, Number(version.number) || 0),
          0,
        ) + 1;
        const version = normalizeVersion({ ...body, number: nextNumber }, nextNumber);
        normalizedPrompt.name = body.name;
        normalizedPrompt.description = body.description;
        normalizedPrompt.updatedAt = version.createdAt;
        normalizedPrompt.currentVersionId = version.id;
        normalizedPrompt.currentVersionNumber = version.number;
        normalizedPrompt.versions.push(version);
        const prompts = getOrganizationPrompts(store, organizationId);
        const index = prompts.findIndex((entry) => String(entry?.id || "") === promptId);
        prompts[index] = normalizedPrompt;
        return { prompt: clone(normalizedPrompt), version: clone(version) };
      });
      if (!result) {
        adapters.sendJson(res, 404, { error: "Prompt not found." });
        return;
      }
      adapters.sendJson(res, 201, result);
      return;
    }

    if (parts.length === 3 && parts[1] === "versions" && method === "PATCH") {
      const versionId = normalizeString(parts[2]);
      const body = readPromptBody(await adapters.readRequestBody(req));
      const result = await withWriteLock((store) => {
        const prompt = findPrompt(store, organizationId, promptId);
        if (!prompt) return { kind: "missing-prompt" };
        const normalizedPrompt = normalizePrompt(prompt);
        const versionIndex = normalizedPrompt.versions.findIndex(
          (version) => String(version?.id || "") === versionId,
        );
        if (versionIndex < 0) return { kind: "missing-version" };
        const existingVersion = normalizedPrompt.versions[versionIndex];
        const now = new Date().toISOString();
        const version = normalizeVersion({
          ...existingVersion,
          ...body,
          id: existingVersion.id,
          number: existingVersion.number,
          createdAt: existingVersion.createdAt,
          updatedAt: now,
        }, existingVersion.number);
        normalizedPrompt.name = body.name;
        normalizedPrompt.description = body.description;
        normalizedPrompt.updatedAt = now;
        normalizedPrompt.currentVersionId = version.id;
        normalizedPrompt.currentVersionNumber = version.number;
        normalizedPrompt.versions[versionIndex] = version;
        const prompts = getOrganizationPrompts(store, organizationId);
        const index = prompts.findIndex((entry) => String(entry?.id || "") === promptId);
        prompts[index] = normalizedPrompt;
        return { kind: "updated", prompt: clone(normalizedPrompt), version: clone(version) };
      });
      if (result?.kind === "missing-prompt") {
        adapters.sendJson(res, 404, { error: "Prompt not found." });
        return;
      }
      if (result?.kind === "missing-version") {
        adapters.sendJson(res, 404, { error: "Prompt version not found." });
        return;
      }
      adapters.sendJson(res, 200, {
        prompt: result.prompt,
        version: result.version,
        savedToCurrentVersion: true,
      });
      return;
    }

    adapters.sendJson(res, 405, { error: "Method not allowed." }, { Allow: "GET, POST, PATCH, DELETE" });
  }

  return Object.freeze({
    handleRequest(req, res, url) {
      if (
        url.pathname !== PROMPTS_PATH
        && !url.pathname.startsWith(`${PROMPTS_PATH}/`)
      ) {
        return false;
      }
      void handle(req, res, url).catch((error) => {
        console.error("[prompts] request failed", error);
        adapters.sendJson(res, 500, {
          error: "Prompt request failed.",
          message: error instanceof Error ? error.message : "Unknown error",
        });
      });
      return true;
    },
  });
}

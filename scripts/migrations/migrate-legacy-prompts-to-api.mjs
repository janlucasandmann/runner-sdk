import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const LEGACY_PROMPT_MIGRATION_KIND = "repo-prompt-json-v1";

function record(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function text(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function versionNumber(value) {
  return Number(value?.number ?? value?.versionNumber ?? 0);
}

function promptVersions(prompt) {
  const versions = Array.isArray(prompt?.versions) ? [...prompt.versions] : [];
  versions.sort((left, right) => versionNumber(left) - versionNumber(right));
  if (!versions.length) {
    throw new Error(`Legacy prompt ${text(prompt?.id, "<unknown>")} has no versions.`);
  }
  versions.forEach((version, index) => {
    if (versionNumber(version) !== index + 1) {
      throw new Error(
        `Legacy prompt ${prompt.id} has a non-contiguous version history at version ${versionNumber(version)}.`,
      );
    }
  });
  const currentVersionId = text(prompt.currentVersionId);
  if (currentVersionId && versions.at(-1)?.id !== currentVersionId) {
    throw new Error(
      `Legacy prompt ${prompt.id} does not use its latest version as the current version.`,
    );
  }
  return versions;
}

function migrationMetadata(prompt, sourceOrganization) {
  const metadata = { ...record(prompt.metadata) };
  delete metadata.creator;
  delete metadata.owner;
  return {
    ...metadata,
    persistenceMigration: {
      kind: LEGACY_PROMPT_MIGRATION_KIND,
      sourcePromptId: text(prompt.id),
      sourceOrganization,
      sourceCreatedAt: text(prompt.createdAt),
      sourceUpdatedAt: text(prompt.updatedAt),
    },
  };
}

function migrationSourceId(prompt) {
  const marker = record(record(prompt?.metadata).persistenceMigration);
  return marker.kind === LEGACY_PROMPT_MIGRATION_KIND
    ? text(marker.sourcePromptId)
    : "";
}

function createApiClient({ origin, apiKey, organizationId, fetchImpl = fetch }) {
  const normalizedOrigin = String(origin || "").replace(/\/+$/, "");
  if (!normalizedOrigin) throw new Error("A migration API origin is required.");
  if (!apiKey) throw new Error("PROMPT_MIGRATION_API_KEY is required.");

  async function request(apiPath, init = {}) {
    const response = await fetchImpl(`${normalizedOrigin}${apiPath}`, {
      ...init,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": apiKey,
        ...(organizationId ? { "x-computer-agents-organization": organizationId } : {}),
        ...(init.headers || {}),
      },
    });
    const bodyText = await response.text();
    let payload = {};
    if (bodyText) {
      try {
        payload = JSON.parse(bodyText);
      } catch {
        payload = { message: bodyText };
      }
    }
    if (!response.ok) {
      const message = text(payload?.message || payload?.error, `HTTP ${response.status}`);
      throw new Error(`${init.method || "GET"} ${apiPath} failed: ${message}`);
    }
    return payload;
  }

  return {
    list: () => request("/api/real/prompts"),
    get: (promptId) => request(`/api/real/prompts/${encodeURIComponent(promptId)}`),
    create: (body) => request("/api/real/prompts", {
      method: "POST",
      body: JSON.stringify(body),
    }),
    update: (promptId, body) => request(`/api/real/prompts/${encodeURIComponent(promptId)}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
    createVersion: (promptId, body) => request(
      `/api/real/prompts/${encodeURIComponent(promptId)}/versions`,
      { method: "POST", body: JSON.stringify(body) },
    ),
    updateVersion: (promptId, versionId, body) => request(
      `/api/real/prompts/${encodeURIComponent(promptId)}/versions/${encodeURIComponent(versionId)}`,
      { method: "PATCH", body: JSON.stringify(body) },
    ),
    publishVersion: (promptId, versionId) => request(
      `/api/real/prompts/${encodeURIComponent(promptId)}/versions/${encodeURIComponent(versionId)}/publish`,
      { method: "POST", body: "{}" },
    ),
  };
}

function versionBody(version) {
  return {
    name: text(version.name, "new-prompt"),
    description: String(version.description ?? ""),
    markdown: String(version.markdown ?? ""),
  };
}

function sameVersion(left, right) {
  const expected = versionBody(left);
  return text(right?.name) === expected.name
    && String(right?.description ?? "") === expected.description
    && String(right?.markdown ?? "") === expected.markdown;
}

async function reconcilePrompt({ api, sourcePrompt, sourceOrganization, dryRun, log }) {
  const sourceVersions = promptVersions(sourcePrompt);
  const listPayload = await api.list();
  const existingPrompts = Array.isArray(listPayload?.prompts)
    ? listPayload.prompts
    : Array.isArray(listPayload?.data) ? listPayload.data : [];
  let target = existingPrompts.find(
    (candidate) => migrationSourceId(candidate) === text(sourcePrompt.id),
  );

  if (dryRun) {
    log(`${target ? "reconcile" : "create"} ${sourcePrompt.id} (${sourceVersions.length} versions)`);
    return { action: target ? "reconcile" : "create", sourcePromptId: sourcePrompt.id };
  }

  const metadata = migrationMetadata(sourcePrompt, sourceOrganization);
  if (!target) {
    const firstVersion = sourceVersions[0];
    const created = await api.create({
      ...versionBody(firstVersion),
      metadata,
      permissionSet: sourcePrompt.permissionSet ?? null,
    });
    target = created.prompt;
    log(`created ${sourcePrompt.id} as ${target.id}`);
  }

  let detail = (await api.get(target.id)).prompt;
  let targetVersions = Array.isArray(detail?.versions) ? detail.versions : [];
  if (targetVersions.length > sourceVersions.length) {
    throw new Error(
      `Target prompt ${target.id} has ${targetVersions.length} versions, more than legacy prompt ${sourcePrompt.id}.`,
    );
  }

  for (const sourceVersion of sourceVersions) {
    const number = versionNumber(sourceVersion);
    let targetVersion = targetVersions.find((candidate) => versionNumber(candidate) === number);
    if (!targetVersion) {
      const created = await api.createVersion(target.id, versionBody(sourceVersion));
      targetVersion = created.version;
      detail = created.prompt;
      targetVersions = Array.isArray(detail?.versions) ? detail.versions : targetVersions.concat(targetVersion);
      log(`created ${sourcePrompt.id} version ${number}`);
    } else if (!sameVersion(sourceVersion, targetVersion)) {
      await api.updateVersion(target.id, targetVersion.id, versionBody(sourceVersion));
      log(`reconciled ${sourcePrompt.id} version ${number}`);
    }
  }

  await api.update(target.id, {
    name: text(sourcePrompt.name, sourceVersions.at(-1)?.name || "new-prompt"),
    description: String(sourcePrompt.description ?? sourceVersions.at(-1)?.description ?? ""),
    metadata,
    permissionSet: sourcePrompt.permissionSet ?? null,
  });

  if (sourcePrompt.publishedVersionId) {
    const sourcePublished = sourceVersions.find((version) => version.id === sourcePrompt.publishedVersionId);
    if (!sourcePublished) throw new Error(`Legacy prompt ${sourcePrompt.id} has an invalid published version.`);
    detail = (await api.get(target.id)).prompt;
    const targetPublished = detail.versions.find(
      (version) => versionNumber(version) === versionNumber(sourcePublished),
    );
    await api.publishVersion(target.id, targetPublished.id);
  }

  detail = (await api.get(target.id)).prompt;
  targetVersions = Array.isArray(detail?.versions) ? detail.versions : [];
  for (const sourceVersion of sourceVersions) {
    const targetVersion = targetVersions.find(
      (candidate) => versionNumber(candidate) === versionNumber(sourceVersion),
    );
    if (!targetVersion || !sameVersion(sourceVersion, targetVersion)) {
      throw new Error(`Verification failed for ${sourcePrompt.id} version ${versionNumber(sourceVersion)}.`);
    }
  }
  if (migrationSourceId(detail) !== sourcePrompt.id) {
    throw new Error(`Verification failed for the ${sourcePrompt.id} migration marker.`);
  }
  log(`verified ${sourcePrompt.id} (${sourceVersions.length} versions)`);
  return { action: "verified", sourcePromptId: sourcePrompt.id, targetPromptId: target.id };
}

export async function migrateLegacyPrompts({
  source,
  sourceOrganization = "default",
  origin,
  apiKey,
  organizationId = "",
  dryRun = false,
  fetchImpl = fetch,
  log = console.log,
}) {
  const raw = JSON.parse(await fs.readFile(path.resolve(source), "utf8"));
  const prompts = raw?.organizations?.[sourceOrganization];
  if (!Array.isArray(prompts)) {
    throw new Error(`Legacy prompt organization ${sourceOrganization} was not found.`);
  }
  const api = createApiClient({ origin, apiKey, organizationId, fetchImpl });
  const results = [];
  for (const sourcePrompt of prompts) {
    results.push(await reconcilePrompt({ api, sourcePrompt, sourceOrganization, dryRun, log }));
  }
  return results;
}

function readArguments(argv) {
  const options = {};
  for (const argument of argv) {
    if (argument === "--dry-run") options.dryRun = true;
    else if (argument.startsWith("--source=")) options.source = argument.slice("--source=".length);
    else if (argument.startsWith("--source-organization=")) {
      options.sourceOrganization = argument.slice("--source-organization=".length);
    } else if (argument.startsWith("--origin=")) options.origin = argument.slice("--origin=".length);
    else if (argument.startsWith("--organization-id=")) {
      options.organizationId = argument.slice("--organization-id=".length);
    } else throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

async function main() {
  const options = readArguments(process.argv.slice(2));
  if (!options.source) {
    throw new Error("--source is required; prompt state must not be read from a repository default.");
  }
  await migrateLegacyPrompts({
    source: options.source,
    sourceOrganization: options.sourceOrganization || "default",
    origin: options.origin || "http://127.0.0.1:4177",
    organizationId: options.organizationId || "",
    apiKey: process.env.PROMPT_MIGRATION_API_KEY,
    dryRun: Boolean(options.dryRun),
  });
}

const entryUrl = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (entryUrl === import.meta.url) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}

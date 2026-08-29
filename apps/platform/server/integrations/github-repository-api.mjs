import { fetchGithubJson } from "./github-api-client.mjs";

const MAX_REPOSITORY_FILES = 250;
const MAX_REPOSITORY_FILE_BYTES = 2 * 1024 * 1024;
const MAX_REPOSITORY_TOTAL_BYTES = 10 * 1024 * 1024;
const GITHUB_WRITE_CONCURRENCY = 6;

export async function handleGithubRepositoryCreate({
  req,
  res,
  url,
  body,
  envFileCandidates,
  allowedOrigins,
  verifyRequestUser,
  loadGithubToken,
  deleteGithubToken,
  sendJson,
  fetchImpl = globalThis.fetch,
}) {
  const verifiedUser = await verifyRequestUser(req, envFileCandidates);
  const credentialId = String(url.searchParams.get("credentialId") || "").trim();
  const token = await loadGithubToken(
    verifiedUser.uid,
    envFileCandidates,
    credentialId,
  );
  if (!token) {
    return sendJson(
      req,
      res,
      404,
      { error: "GitHub not connected" },
      allowedOrigins,
    );
  }

  let request;
  try {
    request = normalizeRepositoryCreateRequest(body);
  } catch (error) {
    return sendJson(
      req,
      res,
      400,
      { error: error instanceof Error ? error.message : "Invalid repository configuration." },
      allowedOrigins,
    );
  }

  try {
    const repository = await createAvailableGithubRepository(
      token.accessToken,
      request,
      fetchImpl,
    );
    const fullName = String(repository?.full_name || "").trim();
    const [owner, repositoryName] = fullName.split("/");
    if (!owner || !repositoryName) {
      throw new Error("GitHub created the repository without returning its full name.");
    }

    await seedGithubRepositorySource({
      accessToken: token.accessToken,
      owner,
      repository: repositoryName,
      branch: String(repository?.default_branch || "main").trim() || "main",
      files: request.files,
      commitMessage: request.commitMessage,
      fetchImpl,
    });

    return sendJson(
      req,
      res,
      201,
      {
        repo: {
          ...repository,
          default_branch: String(repository?.default_branch || "main").trim() || "main",
        },
        seededFileCount: request.files.length,
      },
      allowedOrigins,
    );
  } catch (error) {
    if (error?.status === 401) {
      await deleteGithubToken(
        verifiedUser.uid,
        envFileCandidates,
        token.credentialId,
      );
      return sendJson(
        req,
        res,
        401,
        { error: "GitHub token revoked" },
        allowedOrigins,
      );
    }
    if (Number(error?.status) >= 400 && Number(error?.status) < 500) {
      return sendJson(
        req,
        res,
        Number(error.status),
        {
          error: "GitHub repository creation failed",
          message: error instanceof Error ? error.message : "GitHub rejected the repository.",
        },
        allowedOrigins,
      );
    }
    throw error;
  }
}

export async function handleGithubRepositories({
  req,
  res,
  url,
  envFileCandidates,
  allowedOrigins,
  verifyRequestUser,
  loadGithubToken,
  deleteGithubToken,
  sendJson,
  fetchImpl = globalThis.fetch,
}) {
  const verifiedUser = await verifyRequestUser(req, envFileCandidates);
  const credentialId = String(url.searchParams.get("credentialId") || "").trim();
  const token = await loadGithubToken(
    verifiedUser.uid,
    envFileCandidates,
    credentialId,
  );
  if (!token) {
    return sendJson(
      req,
      res,
      404,
      { error: "GitHub not connected" },
      allowedOrigins,
    );
  }

  try {
    const perPage = Math.min(
      Math.max(Number(url.searchParams.get("per_page")) || 30, 1),
      100,
    );
    const page = Math.max(Number(url.searchParams.get("page")) || 1, 1);
    const affiliation = (url.searchParams.get("affiliation") || "").trim();
    const visibility = (url.searchParams.get("visibility") || "").trim();
    const searchQuery = (url.searchParams.get("search") || "")
      .trim()
      .toLowerCase();
    const params = new URLSearchParams();
    params.set("per_page", String(perPage));
    params.set("page", String(page));
    if (affiliation) params.set("affiliation", affiliation);
    if (visibility) params.set("visibility", visibility);
    const repos = await githubFetchJson(
      `/user/repos?${params.toString()}`,
      token.accessToken,
      fetchImpl,
    );
    const filteredRepos = searchQuery
      ? repos.filter(
          (repo) =>
            String(repo?.name || "").toLowerCase().includes(searchQuery)
            || String(repo?.full_name || "")
              .toLowerCase()
              .includes(searchQuery),
        )
      : repos;

    return sendJson(
      req,
      res,
      200,
      {
        repos: filteredRepos,
        pagination: {
          page,
          perPage,
          count: filteredRepos.length,
        },
      },
      allowedOrigins,
    );
  } catch (error) {
    if (error?.status === 401) {
      await deleteGithubToken(
        verifiedUser.uid,
        envFileCandidates,
        token.credentialId,
      );
      return sendJson(
        req,
        res,
        401,
        { error: "GitHub token revoked" },
        allowedOrigins,
      );
    }
    throw error;
  }
}

export async function handleGithubRepositoryDetail({
  req,
  res,
  url,
  normalizedPathname,
  envFileCandidates,
  allowedOrigins,
  verifyRequestUser,
  loadGithubToken,
  deleteGithubToken,
  sendJson,
  fetchImpl = globalThis.fetch,
}) {
  const verifiedUser = await verifyRequestUser(req, envFileCandidates);
  const credentialId = String(url.searchParams.get("credentialId") || "").trim();
  const token = await loadGithubToken(
    verifiedUser.uid,
    envFileCandidates,
    credentialId,
  );
  if (!token) {
    return sendJson(
      req,
      res,
      404,
      { error: "GitHub not connected" },
      allowedOrigins,
    );
  }

  const suffix = normalizedPathname.replace(/^\/api\/github\/repos\//, "");
  const parts = suffix.split("/").filter(Boolean);
  if (parts.length < 2) {
    return sendJson(
      req,
      res,
      400,
      { error: "Invalid GitHub repository route" },
      allowedOrigins,
    );
  }

  const owner = parts[0];
  const repo = parts[1];
  const action = parts[2] || "";

  try {
    if (!action) {
      const [repoData, readme] = await Promise.all([
        githubFetchJson(`/repos/${owner}/${repo}`, token.accessToken, fetchImpl),
        getGithubReadme(token.accessToken, owner, repo, fetchImpl),
      ]);
      return sendJson(
        req,
        res,
        200,
        { repo: repoData, readme },
        allowedOrigins,
      );
    }

    if (action === "branches") {
      const branches = await githubFetchJson(
        `/repos/${owner}/${repo}/branches`,
        token.accessToken,
        fetchImpl,
      );
      return sendJson(req, res, 200, { branches }, allowedOrigins);
    }

    if (action === "contents") {
      const contentPath = url.searchParams.get("path") || "";
      const ref = url.searchParams.get("ref") || "";
      const encodedPath = contentPath
        ? `/${encodeURIComponent(contentPath).replace(/%2F/g, "/")}`
        : "";
      const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
      const contents = await githubFetchJson(
        `/repos/${owner}/${repo}/contents${encodedPath}${query}`,
        token.accessToken,
        fetchImpl,
      );
      const normalizedContents = Array.isArray(contents)
        ? contents
        : [contents];
      normalizedContents.sort((left, right) => {
        if (left?.type === "dir" && right?.type !== "dir") return -1;
        if (left?.type !== "dir" && right?.type === "dir") return 1;
        return String(left?.name || "").localeCompare(
          String(right?.name || ""),
        );
      });
      return sendJson(
        req,
        res,
        200,
        {
          contents: normalizedContents,
          path: contentPath,
          ref: ref || undefined,
        },
        allowedOrigins,
      );
    }

    if (action === "download") {
      const filePath = url.searchParams.get("path") || "";
      const ref = url.searchParams.get("ref") || "";
      if (!filePath) {
        return sendJson(
          req,
          res,
          400,
          { error: "path query parameter is required" },
          allowedOrigins,
        );
      }
      const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, "/");
      const query = ref ? `?ref=${encodeURIComponent(ref)}` : "";
      const fileContent = await githubFetchJson(
        `/repos/${owner}/${repo}/contents/${encodedPath}${query}`,
        token.accessToken,
        fetchImpl,
      );
      return sendJson(
        req,
        res,
        200,
        {
          name: fileContent.name,
          path: fileContent.path,
          content: fileContent.content,
          encoding: fileContent.encoding,
          size: fileContent.size,
          sha: fileContent.sha,
          mimeType: getMimeTypeForPath(filePath),
        },
        allowedOrigins,
      );
    }

    return sendJson(
      req,
      res,
      404,
      { error: "Unknown GitHub route" },
      allowedOrigins,
    );
  } catch (error) {
    if (error?.status === 401) {
      await deleteGithubToken(
        verifiedUser.uid,
        envFileCandidates,
        token.credentialId,
      );
      return sendJson(
        req,
        res,
        401,
        { error: "GitHub token revoked" },
        allowedOrigins,
      );
    }
    if (error?.status === 404) {
      return sendJson(req, res, 404, { error: "Not found" }, allowedOrigins);
    }
    throw error;
  }
}

async function githubFetchJson(pathname, accessToken, fetchImpl) {
  return fetchGithubJson(pathname, accessToken, { fetchImpl });
}

function normalizeRepositoryCreateRequest(body) {
  const source = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  const name = normalizeGithubRepositoryName(source.name);
  if (!name) {
    throw new Error("A valid repository name is required.");
  }
  const description = String(source.description || "").trim().slice(0, 350);
  const functionId = String(source.functionId || "").trim();
  const suffix = functionId.replace(/[^A-Za-z0-9]/g, "").slice(-8).toLowerCase();
  const files = normalizeGithubRepositoryFiles(source.files, name, description);
  return {
    name,
    suffix,
    description,
    private: source.private !== false,
    files,
    commitMessage: String(source.commitMessage || "Initialize Function source").trim().slice(0, 240)
      || "Initialize Function source",
  };
}

function normalizeGithubRepositoryName(value) {
  const normalized = String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 100)
    .replace(/[.-]+$/g, "");
  return normalized && normalized !== "." && normalized !== ".." ? normalized : "";
}

function normalizeGithubRepositoryFiles(value, repositoryName, description) {
  const sourceFiles = Array.isArray(value) ? value : [];
  if (sourceFiles.length > MAX_REPOSITORY_FILES) {
    throw new Error(`A Function repository can contain at most ${MAX_REPOSITORY_FILES} files.`);
  }
  const seenPaths = new Set();
  let totalBytes = 0;
  const files = sourceFiles.map((entry) => {
    const path = normalizeGithubFilePath(entry?.path);
    if (!path) {
      throw new Error("Every Function source file must have a safe relative path.");
    }
    if (seenPaths.has(path)) {
      throw new Error(`Function source contains the duplicate path ${path}.`);
    }
    seenPaths.add(path);
    const content = typeof entry?.content === "string"
      ? entry.content
      : String(entry?.content ?? "");
    const size = Buffer.byteLength(content, "utf8");
    if (size > MAX_REPOSITORY_FILE_BYTES) {
      throw new Error(`${path} exceeds the 2 MB Function repository file limit.`);
    }
    totalBytes += size;
    if (totalBytes > MAX_REPOSITORY_TOTAL_BYTES) {
      throw new Error("Function source exceeds the 10 MB repository initialization limit.");
    }
    return { path, content };
  });
  if (files.length > 0) return files;
  return [{
    path: "README.md",
    content: `# ${repositoryName}\n\n${description || "Source for a Computer Agents Function."}\n`,
  }];
}

function normalizeGithubFilePath(value) {
  const path = String(value || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\/{2,}/g, "/");
  if (
    !path
    || path.length > 1024
    || path.endsWith("/")
    || path.includes("\0")
    || path.split("/").some((part) => !part || part === "." || part === ".." || part === ".git")
  ) {
    return "";
  }
  return path;
}

function isGithubRepositoryNameConflict(error) {
  if (Number(error?.status) !== 422) return false;
  const payload = error?.payload && typeof error.payload === "object" ? error.payload : {};
  const errors = Array.isArray(payload.errors) ? payload.errors : [];
  return errors.some((entry) => (
    String(entry?.field || "").toLowerCase() === "name"
    && /exist|taken/i.test(String(entry?.message || entry?.code || ""))
  )) || /name.*(exist|taken)/i.test(String(payload?.message || error?.message || ""));
}

function withRepositoryNameSuffix(baseName, suffix) {
  const normalizedSuffix = String(suffix || "").replace(/[^a-z0-9-]/g, "");
  if (!normalizedSuffix) return baseName.slice(0, 100);
  return `${baseName.slice(0, Math.max(1, 99 - normalizedSuffix.length))}-${normalizedSuffix}`;
}

async function createAvailableGithubRepository(accessToken, request, fetchImpl) {
  const candidates = [
    request.name,
    ...(request.suffix ? [withRepositoryNameSuffix(request.name, request.suffix)] : []),
    ...Array.from({ length: 8 }, (_, index) => withRepositoryNameSuffix(request.name, String(index + 2))),
  ].filter((name, index, values) => values.indexOf(name) === index);
  let lastConflict = null;
  for (const name of candidates) {
    try {
      return await fetchGithubJson("/user/repos", accessToken, {
        fetchImpl,
        method: "POST",
        body: {
          name,
          description: request.description,
          private: request.private,
          // GitHub's Git Database API returns 409 for a repository with no object
          // database. Bootstrap it, then replace the branch with our own root commit.
          auto_init: true,
        },
      });
    } catch (error) {
      if (!isGithubRepositoryNameConflict(error)) throw error;
      lastConflict = error;
    }
  }
  throw lastConflict || new Error("No available GitHub repository name could be found.");
}

async function seedGithubRepositorySource({
  accessToken,
  owner,
  repository,
  branch,
  files,
  commitMessage,
  fetchImpl,
}) {
  const encodedOwner = encodeURIComponent(owner);
  const encodedRepository = encodeURIComponent(repository);
  const encodedBranch = String(branch || "main")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const prefix = `/repos/${encodedOwner}/${encodedRepository}`;
  const blobs = await mapWithConcurrency(files, GITHUB_WRITE_CONCURRENCY, async (file) => {
    const blob = await fetchGithubJson(`${prefix}/git/blobs`, accessToken, {
      fetchImpl,
      method: "POST",
      body: {
        content: Buffer.from(file.content, "utf8").toString("base64"),
        encoding: "base64",
      },
    });
    if (!blob?.sha) throw new Error(`GitHub did not create the source blob for ${file.path}.`);
    return {
      path: file.path,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    };
  });
  const tree = await fetchGithubJson(`${prefix}/git/trees`, accessToken, {
    fetchImpl,
    method: "POST",
    body: { tree: blobs },
  });
  if (!tree?.sha) throw new Error("GitHub did not create the Function source tree.");
  const commit = await fetchGithubJson(`${prefix}/git/commits`, accessToken, {
    fetchImpl,
    method: "POST",
    body: {
      message: commitMessage,
      tree: tree.sha,
      parents: [],
    },
  });
  if (!commit?.sha) throw new Error("GitHub did not create the Function source commit.");
  await fetchGithubJson(`${prefix}/git/refs/heads/${encodedBranch}`, accessToken, {
    fetchImpl,
    method: "PATCH",
    body: {
      sha: commit.sha,
      force: true,
    },
  });
  await fetchGithubJson(prefix, accessToken, {
    fetchImpl,
    method: "PATCH",
    body: { default_branch: branch },
  });
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(Math.max(1, concurrency), items.length) }, () => worker()),
  );
  return results;
}

async function getGithubReadme(accessToken, owner, repo, fetchImpl) {
  try {
    const response = await githubFetchJson(
      `/repos/${owner}/${repo}/readme`,
      accessToken,
      fetchImpl,
    );
    if (
      response?.encoding === "base64"
      && typeof response.content === "string"
    ) {
      return Buffer.from(response.content, "base64").toString("utf8");
    }
    return response?.content || null;
  } catch (error) {
    if (error?.status === 404) return null;
    throw error;
  }
}

function getMimeTypeForPath(filePath) {
  const extension = String(filePath || "")
    .split(".")
    .pop()
    ?.toLowerCase() || "";
  const mimeTypes = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    pdf: "application/pdf",
    js: "text/javascript",
    mjs: "text/javascript",
    ts: "text/typescript",
    tsx: "text/typescript",
    jsx: "text/javascript",
    json: "application/json",
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    md: "text/markdown",
    txt: "text/plain",
    py: "text/x-python",
    rb: "text/x-ruby",
    go: "text/x-go",
    rs: "text/x-rust",
    java: "text/x-java",
    c: "text/x-c",
    cpp: "text/x-c++",
    h: "text/x-c",
    sh: "text/x-sh",
    yaml: "text/yaml",
    yml: "text/yaml",
    xml: "application/xml",
  };
  return mimeTypes[extension] || "application/octet-stream";
}

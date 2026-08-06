import { fetchGithubJson } from "./github-api-client.mjs";

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

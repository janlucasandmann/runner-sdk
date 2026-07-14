function encodePathSegment(value) {
  return encodeURIComponent(decodeURIComponent(value));
}

function encodeFilePath(value) {
  return String(value || "")
    .split("/")
    .map(encodePathSegment)
    .join("/");
}

function startRequest(request) {
  void request;
  return true;
}

function requireAdapter(adapters, name) {
  if (typeof adapters[name] !== "function") {
    throw new TypeError(`Files service requires a ${name} adapter.`);
  }
  return adapters[name];
}

/** Owns environment, server, and attachment file proxy routes. */
export function createFilesRequestHandler(adapters) {
  const inferProxyContentTypeFromPath = requireAdapter(adapters, "inferProxyContentTypeFromPath");
  const proxyEnvironmentHtmlPreview = requireAdapter(adapters, "proxyEnvironmentHtmlPreview");
  const proxyUpstreamBinaryGet = requireAdapter(adapters, "proxyUpstreamBinaryGet");
  const proxyUpstreamGet = requireAdapter(adapters, "proxyUpstreamGet");
  const proxyUpstreamJsonRequest = requireAdapter(adapters, "proxyUpstreamJsonRequest");
  const proxyUpstreamRawRequest = requireAdapter(adapters, "proxyUpstreamRawRequest");

  return function handleFilesRequest(req, res, url) {
    const method = String(req.method || "GET").toUpperCase();
    const pathname = url.pathname;

    const environmentFilesMatch = pathname.match(/^\/api\/real\/environments\/([^/]+)\/files$/);
    if (method === "GET" && environmentFilesMatch) {
      return startRequest(proxyUpstreamGet(
        req,
        res,
        `/environments/${encodePathSegment(environmentFilesMatch[1])}/files`,
      ));
    }

    const environmentFilesUploadMatch = pathname.match(/^\/api\/real\/environments\/([^/]+)\/files\/upload$/);
    if (method === "POST" && environmentFilesUploadMatch) {
      return startRequest(proxyUpstreamRawRequest(
        req,
        res,
        `/environments/${encodePathSegment(environmentFilesUploadMatch[1])}/files/upload`,
        "POST",
      ));
    }

    const environmentFilesMkdirMatch = pathname.match(/^\/api\/real\/environments\/([^/]+)\/files\/mkdir$/);
    if (method === "POST" && environmentFilesMkdirMatch) {
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/environments/${encodePathSegment(environmentFilesMkdirMatch[1])}/files/mkdir`,
        "POST",
      ));
    }

    const environmentFilesMoveMatch = pathname.match(/^\/api\/real\/environments\/([^/]+)\/files\/move$/);
    if (method === "POST" && environmentFilesMoveMatch) {
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/environments/${encodePathSegment(environmentFilesMoveMatch[1])}/files/move`,
        "POST",
      ));
    }

    const environmentFilesSendMatch = pathname.match(/^\/api\/real\/environments\/([^/]+)\/files\/send$/);
    if (method === "POST" && environmentFilesSendMatch) {
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/environments/${encodePathSegment(environmentFilesSendMatch[1])}/files/send`,
        "POST",
      ));
    }

    const environmentFilesShareWithTeamMatch = pathname.match(/^\/api\/real\/environments\/([^/]+)\/files\/share-with-team$/);
    if (method === "POST" && environmentFilesShareWithTeamMatch) {
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/environments/${encodePathSegment(environmentFilesShareWithTeamMatch[1])}/files/share-with-team`,
        "POST",
      ));
    }

    const environmentThumbnailMatch = pathname.match(/^\/api\/real\/environments\/([^/]+)\/files\/thumbnail\/(.+)$/);
    if (method === "GET" && environmentThumbnailMatch) {
      const environmentId = encodePathSegment(environmentThumbnailMatch[1]);
      const filePath = encodeFilePath(environmentThumbnailMatch[2]);
      return startRequest(proxyUpstreamBinaryGet(
        req,
        res,
        `/environments/${environmentId}/files/thumbnail/${filePath}`,
        { contentType: "image/webp" },
      ));
    }

    const environmentDownloadMatch = pathname.match(/^\/api\/real\/environments\/([^/]+)\/files\/download\/(.+)$/);
    if (method === "GET" && environmentDownloadMatch) {
      const environmentId = encodePathSegment(environmentDownloadMatch[1]);
      const filePath = encodeFilePath(environmentDownloadMatch[2]);
      return startRequest(proxyUpstreamBinaryGet(
        req,
        res,
        `/environments/${environmentId}/files/download/${filePath}`,
        { contentType: inferProxyContentTypeFromPath(filePath) },
      ));
    }

    const environmentHtmlPreviewMatch = pathname.match(/^\/api\/real\/environments\/([^/]+)\/files\/preview-html\/(.+)$/);
    if (method === "GET" && environmentHtmlPreviewMatch) {
      return startRequest(proxyEnvironmentHtmlPreview(
        req,
        res,
        environmentHtmlPreviewMatch[1],
        environmentHtmlPreviewMatch[2],
      ));
    }

    const environmentFilesDeleteMatch = pathname.match(/^\/api\/real\/environments\/([^/]+)\/files\/(.+)$/);
    if (method === "DELETE" && environmentFilesDeleteMatch) {
      const environmentId = encodePathSegment(environmentFilesDeleteMatch[1]);
      const filePath = encodeFilePath(environmentFilesDeleteMatch[2]);
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/environments/${environmentId}/files/${filePath}`,
        "DELETE",
      ));
    }

    const serverFilesMatch = pathname.match(/^\/api\/real\/servers\/([^/]+)\/files$/);
    if (method === "GET" && serverFilesMatch) {
      return startRequest(proxyUpstreamGet(
        req,
        res,
        `/servers/${encodePathSegment(serverFilesMatch[1])}/files`,
      ));
    }

    const serverFilesUploadMatch = pathname.match(/^\/api\/real\/servers\/([^/]+)\/files\/upload$/);
    if (method === "POST" && serverFilesUploadMatch) {
      return startRequest(proxyUpstreamRawRequest(
        req,
        res,
        `/servers/${encodePathSegment(serverFilesUploadMatch[1])}/files/upload`,
        "POST",
      ));
    }

    const serverFileContentMatch = pathname.match(/^\/api\/real\/servers\/([^/]+)\/files\/content\/(.+)$/);
    if (["GET", "PUT"].includes(method) && serverFileContentMatch) {
      const serverId = encodePathSegment(serverFileContentMatch[1]);
      const filePath = encodeFilePath(serverFileContentMatch[2]);
      if (method === "GET") {
        return startRequest(proxyUpstreamGet(req, res, `/servers/${serverId}/files/content/${filePath}`));
      }
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/servers/${serverId}/files/content/${filePath}`,
        "PUT",
      ));
    }

    const serverDownloadMatch = pathname.match(/^\/api\/real\/servers\/([^/]+)\/files\/download\/(.+)$/);
    if (method === "GET" && serverDownloadMatch) {
      const serverId = encodePathSegment(serverDownloadMatch[1]);
      const filePath = encodeFilePath(serverDownloadMatch[2]);
      return startRequest(proxyUpstreamBinaryGet(
        req,
        res,
        `/servers/${serverId}/files/download/${filePath}`,
      ));
    }

    const serverFilesDeleteMatch = pathname.match(/^\/api\/real\/servers\/([^/]+)\/files\/(.+)$/);
    if (method === "DELETE" && serverFilesDeleteMatch) {
      const serverId = encodePathSegment(serverFilesDeleteMatch[1]);
      const filePath = encodeFilePath(serverFilesDeleteMatch[2]);
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/servers/${serverId}/files/${filePath}`,
        "DELETE",
      ));
    }

    if (method === "POST" && pathname === "/api/real/attachments/upload") {
      return startRequest(proxyUpstreamJsonRequest(req, res, "/attachments/upload", "POST"));
    }

    const attachmentMatch = pathname.match(/^\/api\/real\/attachments\/([^/]+)$/);
    if (method === "GET" && attachmentMatch) {
      return startRequest(proxyUpstreamBinaryGet(
        req,
        res,
        `/attachments/${encodePathSegment(attachmentMatch[1])}`,
      ));
    }

    return false;
  };
}


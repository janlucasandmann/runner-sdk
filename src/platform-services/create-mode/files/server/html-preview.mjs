function requireAdapter(adapters, name) {
  if (typeof adapters[name] !== "function") {
    throw new TypeError(`Files service requires a ${name} adapter.`);
  }
  return adapters[name];
}

/**
 * Builds the Files HTML-preview transport. It downloads the workspace document
 * through the same authenticated upstream selection as the host, then injects
 * a base URL so relative assets resolve through the Files download endpoint.
 */
export function createEnvironmentHtmlPreviewProxy(adapters) {
  const fetchAiosApi = requireAdapter(adapters, "fetchAiosApi");
  const fetchAiosCloud = requireAdapter(adapters, "fetchAiosCloud");
  const hasAiosSession = requireAdapter(adapters, "hasAiosSession");
  const isUnauthorizedHttpStatus = requireAdapter(adapters, "isUnauthorizedHttpStatus");
  const parseUpstreamUrl = requireAdapter(adapters, "parseUpstreamUrl");
  const readOptionalApiKey = requireAdapter(adapters, "readOptionalApiKey");
  const sendJson = requireAdapter(adapters, "sendJson");
  const withProxyOrganizationHeader = requireAdapter(adapters, "withProxyOrganizationHeader");
  const fetchImpl = typeof adapters.fetchImpl === "function" ? adapters.fetchImpl : globalThis.fetch;
  const port = Number(adapters.port || 4177);

  if (typeof fetchImpl !== "function") {
    throw new TypeError("Files service requires a fetch implementation.");
  }

  return async function proxyEnvironmentHtmlPreview(req, res, environmentId, filePath) {
    try {
      const upstreamUrl = parseUpstreamUrl(req, {});
      const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
      const apiKey = readOptionalApiKey(req, {});
      const normalizedEnvironmentId = encodeURIComponent(decodeURIComponent(environmentId));
      const normalizedFilePath = filePath
        .split("/")
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join("/");
      const upstreamPath = `/environments/${normalizedEnvironmentId}/files/download/${normalizedFilePath}`;

      let upstream;
      if (apiKey) {
        const upstreamTarget = new URL(`${upstreamUrl}${upstreamPath}`);
        upstreamTarget.search = requestUrl.search;
        upstream = await fetchImpl(upstreamTarget.toString(), {
          method: "GET",
          headers: withProxyOrganizationHeader(req, {}, {
            "X-API-Key": apiKey,
          }),
        });
      } else if (hasAiosSession(req)) {
        upstream = await fetchAiosCloud(req, upstreamPath, {
          method: "GET",
        });
        if (isUnauthorizedHttpStatus(upstream.status) || upstream.status === 404) {
          upstream = await fetchAiosApi(req, `/api${upstreamPath}${requestUrl.search}`, {
            method: "GET",
          });
        }
      } else {
        return sendJson(res, 401, {
          error: "Unauthorized",
          message: "Sign in with Computer Agents or provide an API key.",
        });
      }

      const responseText = await upstream.text();
      if (!upstream.ok) {
        let parsed = {};
        try {
          parsed = responseText ? JSON.parse(responseText) : {};
        } catch {
          parsed = { message: responseText };
        }
        return sendJson(res, upstream.status, parsed);
      }

      const normalizedPathSegments = normalizedFilePath.split("/").filter(Boolean);
      const directorySegments = normalizedPathSegments.slice(0, -1);
      const directoryDownloadUrl = new URL(
        `/api/real/environments/${normalizedEnvironmentId}/files/download/${directorySegments.length ? `${directorySegments.join("/")}/` : ""}`,
        requestUrl.origin,
      ).toString();
      const escapedBaseHref = directoryDownloadUrl
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const baseTag = `<base href="${escapedBaseHref}" />`;
      const shellStyles =
        '<style>html,body{margin:0;padding:0;background:#fff;color:#111;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}img,svg,video,canvas,iframe{max-width:100%;height:auto;}pre{white-space:pre-wrap;word-break:break-word;}table{max-width:100%;border-collapse:collapse;}*{box-sizing:border-box;}</style>';
      let rewrittenHtml = String(responseText || "");
      if (/<head[\s>]/i.test(rewrittenHtml)) {
        rewrittenHtml = rewrittenHtml.replace(/<head(\s[^>]*)?>/i, (match) => `${match}${baseTag}${shellStyles}`);
      } else if (/<html[\s>]/i.test(rewrittenHtml)) {
        rewrittenHtml = rewrittenHtml.replace(/<html(\s[^>]*)?>/i, (match) => `${match}<head>${baseTag}${shellStyles}</head>`);
      } else {
        rewrittenHtml = `<!doctype html><html><head><meta charset="utf-8" />${baseTag}${shellStyles}</head><body>${rewrittenHtml}</body></html>`;
      }

      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(rewrittenHtml);
    } catch (error) {
      return sendJson(res, 502, {
        error: "Failed to load environment HTML preview",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };
}


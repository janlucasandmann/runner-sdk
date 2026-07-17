import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

export function createStaticAssetService({
  aiosPublicRoot,
  distRoot,
  packageRoot,
  port,
}) {
  function isPathInsideRoot(root, candidate) {
    const relative = path.relative(path.resolve(root), path.resolve(candidate));
    return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
  }

  function resolvePathInsideRoot(root, relativePath) {
    const candidate = path.resolve(root, String(relativePath || "").replace(/^[/\\]+/, ""));
    return isPathInsideRoot(root, candidate) ? candidate : null;
  }

  function getContentType(pathname) {
    const extension = path.extname(pathname).toLowerCase();
    return {
      ".avif": "image/avif",
      ".css": "text/css; charset=utf-8",
      ".d.ts": "text/plain; charset=utf-8",
      ".gif": "image/gif",
      ".html": "text/html; charset=utf-8",
      ".jpeg": "image/jpeg",
      ".jpg": "image/jpeg",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".map": "application/json; charset=utf-8",
      ".mjs": "text/javascript; charset=utf-8",
      ".mp4": "video/mp4",
      ".png": "image/png",
      ".svg": "image/svg+xml",
      ".webm": "video/webm",
      ".webp": "image/webp",
      ".woff2": "font/woff2",
    }[extension] || "application/octet-stream";
  }

  function sendFileResponse(req, res, file, contentType, cacheControl = "no-store") {
    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": file.byteLength,
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
    });
    res.end(req.method === "HEAD" ? undefined : file);
  }

  async function serveDistAsset(req, res) {
    const pathname = new URL(req.url, `http://localhost:${port}`).pathname;
    const normalized = resolvePathInsideRoot(
      distRoot,
      pathname.slice("/dist/".length),
    );

    if (!normalized) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    try {
      const file = await fs.readFile(normalized);
      sendFileResponse(req, res, file, getContentType(pathname));
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  }

  async function servePlatformClient(req, res, url) {
    const clientRoot = path.join(distRoot, "platform-client");
    const pathname = url?.pathname
      || new URL(req.url, `http://localhost:${port}`).pathname;
    const relativePath = pathname.startsWith("/platform-client/")
      ? pathname.slice("/platform-client/".length)
      : "";
    const requestedPath = relativePath && path.extname(relativePath)
      ? relativePath
      : "index.html";
    const normalized = resolvePathInsideRoot(clientRoot, requestedPath);

    if (!normalized) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    try {
      const file = await fs.readFile(normalized);
      const isDocument = requestedPath === "index.html";
      sendFileResponse(
        req,
        res,
        file,
        getContentType(requestedPath),
        isDocument
          ? "no-store"
          : "public, max-age=31536000, immutable",
      );
    } catch {
      res.writeHead(404);
      res.end("Platform client has not been built.");
    }
  }

  async function serveAiosPublicAsset(req, res, assetPath = "") {
    const pathname = assetPath || new URL(req.url, `http://localhost:${port}`).pathname;
    const contentType = getContentType(pathname);
  
    for (const root of [aiosPublicRoot, packageRoot]) {
      const normalized = resolvePathInsideRoot(root, pathname);
      if (!normalized) {
        continue;
      }
  
      try {
        const stat = await fs.stat(normalized);
        const supportsRanges = contentType.startsWith("video/") || contentType.startsWith("audio/");
        const baseHeaders = {
          "Content-Type": contentType,
          "Content-Length": stat.size,
          "Cache-Control": "no-store",
        };
  
        if (supportsRanges) {
          baseHeaders["Accept-Ranges"] = "bytes";
        }
  
        const rangeHeader = supportsRanges && typeof req.headers.range === "string" ? req.headers.range : "";
        const rangeMatch = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);
        if (rangeMatch) {
          const [, rawStart, rawEnd] = rangeMatch;
          let start = rawStart ? Number(rawStart) : 0;
          let end = rawEnd ? Number(rawEnd) : stat.size - 1;
  
          if (!rawStart && rawEnd) {
            const suffixLength = Number(rawEnd);
            start = Number.isFinite(suffixLength) ? Math.max(stat.size - suffixLength, 0) : 0;
            end = stat.size - 1;
          }
  
          if (
            !Number.isInteger(start)
            || !Number.isInteger(end)
            || start < 0
            || end < start
            || start >= stat.size
          ) {
            res.writeHead(416, {
              "Content-Range": `bytes */${stat.size}`,
              "Cache-Control": "no-store",
            });
            res.end();
            return;
          }
  
          end = Math.min(end, stat.size - 1);
          res.writeHead(206, {
            ...baseHeaders,
            "Content-Length": end - start + 1,
            "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          });
          if (req.method === "HEAD") {
            res.end();
          } else {
            createReadStream(normalized, { start, end }).pipe(res);
          }
          return;
        }
  
        res.writeHead(200, baseHeaders);
        if (req.method === "HEAD") {
          res.end();
        } else {
          createReadStream(normalized).pipe(res);
        }
        return;
      } catch {}
    }
  
    res.writeHead(404);
    res.end("Not found");
  }

  async function serveVendorAsset(req, res, vendorRoot, vendorPrefix) {
    const pathname = new URL(req.url, `http://localhost:${port}`).pathname;
    const relativePath = pathname.startsWith(vendorPrefix) ? pathname.slice(vendorPrefix.length) : "";
    const normalized = resolvePathInsideRoot(vendorRoot, relativePath);

    if (!normalized) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    try {
      const file = await fs.readFile(normalized);
      sendFileResponse(req, res, file, getContentType(pathname));
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  }

  return Object.freeze({
    serveDistAsset,
    servePlatformClient,
    serveAiosPublicAsset,
    serveVendorAsset,
  });
}

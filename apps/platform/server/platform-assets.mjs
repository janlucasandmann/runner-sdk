import { createHash } from "node:crypto";
import { brotliCompressSync, constants as zlibConstants, gzipSync } from "node:zlib";
import {
  normalizePlatformSources,
  renderPlatformDocument,
} from "../shared/platform-source-contract.mjs";

const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable";

function hashContent(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 20);
}

function parseAcceptedEncodings(value) {
  return String(value || "")
    .split(",")
    .map((entry) => {
      const [namePart, ...parameterParts] = entry.trim().toLowerCase().split(";");
      let quality = 1;
      for (const parameter of parameterParts) {
        const match = parameter.trim().match(/^q=([0-9.]+)$/);
        if (match) {
          const parsed = Number(match[1]);
          quality = Number.isFinite(parsed) ? parsed : 0;
        }
      }
      return { name: namePart.trim(), quality };
    })
    .filter((entry) => entry.name && entry.quality > 0)
    .sort((left, right) => right.quality - left.quality);
}

function selectContentEncoding(headerValue) {
  const encodings = parseAcceptedEncodings(headerValue);
  for (const encoding of encodings) {
    if (encoding.name === "br") return "br";
    if (encoding.name === "gzip") return "gzip";
    if (encoding.name === "*") return "br";
  }
  return "identity";
}

function createAsset(pathname, contentType, source) {
  const identity = Buffer.from(source);
  const hash = hashContent(identity);
  return Object.freeze({
    pathname,
    contentType,
    hash,
    etag: `"${hash}"`,
    variants: Object.freeze({
      identity,
      gzip: gzipSync(identity, { level: 9 }),
      br: brotliCompressSync(identity, {
        params: {
          [zlibConstants.BROTLI_PARAM_QUALITY]: 9,
          [zlibConstants.BROTLI_PARAM_MODE]: contentType.startsWith("text/css")
            ? zlibConstants.BROTLI_MODE_TEXT
            : zlibConstants.BROTLI_MODE_TEXT,
        },
      }),
    }),
  });
}

/**
 * Publishes an explicit platform shell, stylesheet, and browser module as
 * immutable content-addressed assets.
 */
export function createPlatformDocumentAssets(
  sources,
  { assetBasePath = "/platform/assets" } = {},
) {
  const {
    documentTemplate,
    styleSource,
    moduleSource,
  } = normalizePlatformSources(sources);
  const cssHash = hashContent(styleSource);
  const moduleHash = hashContent(moduleSource);
  const normalizedBasePath = `/${String(assetBasePath || "platform/assets")
    .replace(/^\/+|\/+$/g, "")}`;
  const cssPath = `${normalizedBasePath}/platform.${cssHash}.css`;
  const modulePath = `${normalizedBasePath}/platform.${moduleHash}.js`;
  const cssAsset = createAsset(cssPath, "text/css; charset=utf-8", styleSource);
  const moduleAsset = createAsset(modulePath, "text/javascript; charset=utf-8", moduleSource);

  const documentHtml = renderPlatformDocument(
    documentTemplate,
    {
      styleTag: `<link rel="stylesheet" href="${cssPath}" />`,
      moduleTag: `<script type="module" src="${modulePath}"></script>`,
    },
  );

  const assetsByPath = new Map([
    [cssAsset.pathname, cssAsset],
    [moduleAsset.pathname, moduleAsset],
  ]);

  return Object.freeze({
    documentHtml,
    cssPath,
    modulePath,
    metrics: Object.freeze({
      sourceBytes:
        Buffer.byteLength(documentTemplate)
        + Buffer.byteLength(styleSource)
        + Buffer.byteLength(moduleSource),
      documentBytes: Buffer.byteLength(documentHtml),
      cssBytes: cssAsset.variants.identity.byteLength,
      moduleBytes: moduleAsset.variants.identity.byteLength,
      cssBrotliBytes: cssAsset.variants.br.byteLength,
      moduleBrotliBytes: moduleAsset.variants.br.byteLength,
    }),
    handleRequest(req, res, url) {
      const asset = assetsByPath.get(url.pathname);
      if (!asset || !["GET", "HEAD"].includes(String(req.method || "GET").toUpperCase())) {
        return false;
      }

      if (String(req.headers["if-none-match"] || "") === asset.etag) {
        res.writeHead(304, {
          ETag: asset.etag,
          "Cache-Control": IMMUTABLE_CACHE_CONTROL,
          Vary: "Accept-Encoding",
        });
        res.end();
        return true;
      }

      const encoding = selectContentEncoding(req.headers["accept-encoding"]);
      const body = asset.variants[encoding] || asset.variants.identity;
      const headers = {
        "Content-Type": asset.contentType,
        "Content-Length": body.byteLength,
        "Cache-Control": IMMUTABLE_CACHE_CONTROL,
        ETag: asset.etag,
        Vary: "Accept-Encoding",
        "X-Content-Type-Options": "nosniff",
      };
      if (encoding !== "identity") {
        headers["Content-Encoding"] = encoding;
      }
      res.writeHead(200, headers);
      res.end(String(req.method || "GET").toUpperCase() === "HEAD" ? undefined : body);
      return true;
    },
  });
}

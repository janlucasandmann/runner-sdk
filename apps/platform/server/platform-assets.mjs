import { createHash } from "node:crypto";
import { brotliCompressSync, constants as zlibConstants, gzipSync } from "node:zlib";

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

function replaceRequiredSource(documentHtml, matcher, replacement, label) {
  if (!matcher.test(documentHtml)) {
    throw new Error(`Platform document is missing its ${label}.`);
  }
  return documentHtml.replace(matcher, replacement);
}

export function extractPlatformDocumentSources(inlineDocumentHtml) {
  const source = String(inlineDocumentHtml || "");
  const styleMatch = source.match(/<style>([\s\S]*?)<\/style>/);
  const moduleMatch = source.match(/<script type="module">([\s\S]*?)<\/script>/);
  if (!styleMatch) {
    throw new Error("Platform document does not contain an inline style block.");
  }
  if (!moduleMatch) {
    throw new Error("Platform document does not contain an inline module script.");
  }
  return Object.freeze({
    documentHtml: source,
    cssSource: styleMatch[1],
    moduleSource: moduleMatch[1],
  });
}

/**
 * Converts the legacy inline platform document into a thin HTML shell plus
 * immutable, content-addressed CSS and JavaScript assets.
 *
 * This compatibility seam intentionally preserves the browser program byte for
 * byte while the client is migrated to ordinary typed modules.
 */
export function createPlatformDocumentAssets(
  inlineDocumentHtml,
  { assetBasePath = "/platform/assets" } = {},
) {
  const {
    documentHtml: source,
    cssSource,
    moduleSource,
  } = extractPlatformDocumentSources(inlineDocumentHtml);
  const cssHash = hashContent(cssSource);
  const moduleHash = hashContent(moduleSource);
  const normalizedBasePath = `/${String(assetBasePath || "platform/assets")
    .replace(/^\/+|\/+$/g, "")}`;
  const cssPath = `${normalizedBasePath}/platform.${cssHash}.css`;
  const modulePath = `${normalizedBasePath}/platform.${moduleHash}.js`;
  const cssAsset = createAsset(cssPath, "text/css; charset=utf-8", cssSource);
  const moduleAsset = createAsset(modulePath, "text/javascript; charset=utf-8", moduleSource);

  let documentHtml = replaceRequiredSource(
    source,
    /<style>[\s\S]*?<\/style>/,
    `<link rel="stylesheet" href="${cssPath}" />`,
    "inline style block",
  );
  documentHtml = replaceRequiredSource(
    documentHtml,
    /<script type="module">[\s\S]*?<\/script>/,
    `<script type="module" src="${modulePath}"></script>`,
    "inline module script",
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
      inlineDocumentBytes: Buffer.byteLength(source),
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

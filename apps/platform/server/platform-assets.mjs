import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompressSync, constants as zlibConstants, gzipSync } from "node:zlib";
import { build, transform } from "esbuild";
import {
  normalizePlatformSources,
  renderPlatformDocument,
} from "../shared/platform-source-contract.mjs";

const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable";
const DEFAULT_PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

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

export function selectContentEncoding(headerValue) {
  const encodings = parseAcceptedEncodings(headerValue);
  for (const encoding of encodings) {
    if (encoding.name === "br") return "br";
    if (encoding.name === "gzip") return "gzip";
    if (encoding.name === "*") return "br";
  }
  return "identity";
}

export function createAsset(
  pathname,
  contentType,
  source,
  {
    compress = true,
    gzipLevel = 9,
    brotliQuality = 9,
  } = {},
) {
  const identity = Buffer.from(source);
  const hash = hashContent(identity);
  const variants = {
    identity,
    ...(compress
      ? {
          gzip: gzipSync(identity, { level: gzipLevel }),
          br: brotliCompressSync(identity, {
            params: {
              [zlibConstants.BROTLI_PARAM_QUALITY]: brotliQuality,
              [zlibConstants.BROTLI_PARAM_MODE]: contentType.startsWith("text/css")
                ? zlibConstants.BROTLI_MODE_TEXT
                : zlibConstants.BROTLI_MODE_TEXT,
            },
          }),
        }
      : {}),
  };
  return Object.freeze({
    pathname,
    contentType,
    hash,
    etag: `"${hash}"`,
    variants: Object.freeze(variants),
  });
}

async function optimizePlatformSources(
  {
    styleSource,
    moduleSource,
  },
  {
    packageRoot,
  },
) {
  const normalizedPackageRoot = path.resolve(packageRoot);
  const distRoot = path.join(normalizedPackageRoot, "dist");
  const [moduleBuild, styleBuild] = await Promise.all([
    build({
      stdin: {
        contents: moduleSource,
        loader: "js",
        resolveDir: normalizedPackageRoot,
        sourcefile: "platform-runtime.js",
      },
      bundle: true,
      charset: "utf8",
      external: [
        "/api/*",
        "/vendor/*",
      ],
      format: "esm",
      chunkNames: "chunk-[hash]",
      entryNames: "entry",
      legalComments: "none",
      logLevel: "silent",
      metafile: true,
      minify: true,
      outdir: path.join(normalizedPackageRoot, ".platform-assets"),
      packages: "external",
      platform: "browser",
      plugins: [
        {
          name: "platform-local-dist-bundle",
          setup(builder) {
            builder.onResolve({ filter: /^\/dist\// }, (args) => {
              const resolvedPath = path.resolve(
                normalizedPackageRoot,
                `.${args.path}`,
              );
              if (
                resolvedPath !== distRoot
                && !resolvedPath.startsWith(`${distRoot}${path.sep}`)
              ) {
                return {
                  errors: [{
                    text: `Platform asset import escapes dist: ${args.path}`,
                  }],
                };
              }
              return { path: resolvedPath };
            });
          },
        },
      ],
      splitting: true,
      target: "es2022",
      treeShaking: true,
      write: false,
    }),
    transform(styleSource, {
      charset: "utf8",
      legalComments: "none",
      loader: "css",
      minify: true,
      target: "es2022",
    }),
  ]);

  const moduleOutput = moduleBuild.outputFiles.find(
    (outputFile) => path.basename(outputFile.path) === "entry.js",
  );
  if (!moduleOutput) {
    throw new Error("Platform browser bundle did not emit a JavaScript asset.");
  }
  const chunkOutputs = moduleBuild.outputFiles.filter(
    (outputFile) => outputFile !== moduleOutput && outputFile.path.endsWith(".js"),
  );
  const unexpectedOutputs = moduleBuild.outputFiles.filter(
    (outputFile) => (
      outputFile !== moduleOutput
      && !chunkOutputs.includes(outputFile)
    ),
  );
  if (unexpectedOutputs.length > 0) {
    throw new Error(
      `Platform browser bundle emitted unsupported assets: ${
        unexpectedOutputs.map((outputFile) => path.basename(outputFile.path)).join(", ")
      }.`,
    );
  }

  return Object.freeze({
    styleSource: styleBuild.code,
    moduleSource: moduleOutput.text,
    moduleChunks: Object.freeze(chunkOutputs.map((outputFile) => Object.freeze({
      filename: path.basename(outputFile.path),
      source: outputFile.text,
    }))),
    moduleGraphInputs: Object.keys(moduleBuild.metafile?.inputs || {}).length,
  });
}

/**
 * Publishes an explicit platform shell, stylesheet, and browser module as
 * immutable content-addressed assets.
 */
export async function createPlatformDocumentAssets(
  sources,
  {
    assetBasePath = "/platform/assets",
    packageRoot = DEFAULT_PACKAGE_ROOT,
  } = {},
) {
  const {
    documentTemplate,
    styleSource,
    moduleSource,
  } = normalizePlatformSources(sources);
  const optimizedSources = await optimizePlatformSources(
    {
      styleSource,
      moduleSource,
    },
    {
      packageRoot,
    },
  );
  const cssHash = hashContent(optimizedSources.styleSource);
  const moduleHash = hashContent(optimizedSources.moduleSource);
  const normalizedBasePath = `/${String(assetBasePath || "platform/assets")
    .replace(/^\/+|\/+$/g, "")}`;
  const cssPath = `${normalizedBasePath}/platform.${cssHash}.css`;
  const modulePath = `${normalizedBasePath}/platform.${moduleHash}.js`;
  const cssAsset = createAsset(
    cssPath,
    "text/css; charset=utf-8",
    optimizedSources.styleSource,
  );
  const moduleAsset = createAsset(
    modulePath,
    "text/javascript; charset=utf-8",
    optimizedSources.moduleSource,
  );
  const chunkAssets = optimizedSources.moduleChunks.map((chunk) => createAsset(
    `${normalizedBasePath}/${chunk.filename}`,
    "text/javascript; charset=utf-8",
    chunk.source,
  ));

  const documentHtml = renderPlatformDocument(
    documentTemplate,
    {
      styleTag: `<link rel="stylesheet" href="${cssPath}" fetchpriority="high" />`,
      moduleTag: `<script type="module" src="${modulePath}" fetchpriority="high"></script>`,
    },
  );

  const assetsByPath = new Map([
    [cssAsset.pathname, cssAsset],
    [moduleAsset.pathname, moduleAsset],
    ...chunkAssets.map((asset) => [asset.pathname, asset]),
  ]);

  return Object.freeze({
    documentHtml,
    cssPath,
    modulePath,
    chunkPaths: Object.freeze(chunkAssets.map((asset) => asset.pathname)),
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
      moduleChunkBytes: chunkAssets.reduce(
        (total, asset) => total + asset.variants.identity.byteLength,
        0,
      ),
      moduleChunkBrotliBytes: chunkAssets.reduce(
        (total, asset) => total + asset.variants.br.byteLength,
        0,
      ),
      moduleChunkCount: chunkAssets.length,
      sourceCssBytes: Buffer.byteLength(styleSource),
      sourceModuleBytes: Buffer.byteLength(moduleSource),
      moduleGraphInputs: optimizedSources.moduleGraphInputs,
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

      const requestedEncoding = selectContentEncoding(req.headers["accept-encoding"]);
      const encoding = asset.variants[requestedEncoding] ? requestedEncoding : "identity";
      const body = asset.variants[encoding];
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

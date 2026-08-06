import { transform } from "esbuild";

import {
  createAsset,
  selectContentEncoding,
} from "./platform-assets.mjs";
import {
  resolveLegacyBrowserSourcePath,
  toViteFileUrl,
} from "../shared/legacy-source-resolution.mjs";
import {
  resolveDevelopmentStyleSourcePaths,
} from "../shared/development-style-resolution.mjs";
import {
  normalizePlatformSources,
  renderPlatformDocument,
} from "../shared/platform-source-contract.mjs";

function rewriteDevelopmentStylesheets(documentHtml, packageRoot, viteOrigin) {
  const emittedSourceUrls = new Set();
  return documentHtml.replace(/<link\b[^>]*>/gi, (linkTag) => {
    if (!/\brel=(["'])stylesheet\1/i.test(linkTag)) {
      return linkTag;
    }
    const hrefMatch = linkTag.match(/\bhref=(["'])(\/dist\/[^"']+\.css)\1/i);
    if (!hrefMatch) {
      return linkTag;
    }
    const sourcePaths = resolveDevelopmentStyleSourcePaths(packageRoot, hrefMatch[2]);
    if (sourcePaths.length === 0) {
      return linkTag;
    }
    return sourcePaths
      .map((sourcePath) => toViteFileUrl(viteOrigin, sourcePath))
      .filter((sourceUrl) => {
        if (emittedSourceUrls.has(sourceUrl)) {
          return false;
        }
        emittedSourceUrls.add(sourceUrl);
        return true;
      })
      .map((sourceUrl) => `<link rel="stylesheet" href="${sourceUrl}" />`)
      .join("\n");
  });
}

function createDevelopmentRuntimeScripts(viteOrigin) {
  const refreshRuntimeUrl = JSON.stringify(`${viteOrigin}/@react-refresh`);
  const viteClientUrl = JSON.stringify(`${viteOrigin}/@vite/client`);
  return `  <script type="module">
    import RefreshRuntime from ${refreshRuntimeUrl};
    RefreshRuntime.injectIntoGlobalHook(window);
    window.$RefreshReg$ = () => {};
    window.$RefreshSig$ = () => (type) => type;
    window.__vite_plugin_react_preamble_installed__ = true;
  </script>
  <script type="module" src=${viteClientUrl}></script>`;
}

/**
 * Serves the platform runtime without a production build while rewriting its
 * compiled /dist imports to Vite-served source modules. Extracted React modules
 * therefore receive Fast Refresh inside the canonical platform document.
 */
export async function createPlatformDevelopmentAssets(
  sources,
  {
    packageRoot,
    viteOrigin,
  },
) {
  const normalizedViteOrigin = String(viteOrigin || "").replace(/\/+$/, "");
  if (!normalizedViteOrigin) {
    throw new Error("Platform development assets require a Vite origin.");
  }
  const {
    documentTemplate,
    styleSource,
    moduleSource,
  } = normalizePlatformSources(sources);
  const rewrittenModuleSource = moduleSource.replace(
    /(["'])(\/dist\/[^"']+)\1/g,
    (match, quote, specifier) => {
      const sourcePath = resolveLegacyBrowserSourcePath(packageRoot, specifier);
      return sourcePath
        ? `${quote}${toViteFileUrl(normalizedViteOrigin, sourcePath)}${quote}`
        : match;
    },
  );
  const [optimizedModule, optimizedStyle] = await Promise.all([
    transform(rewrittenModuleSource, {
      charset: "utf8",
      format: "esm",
      legalComments: "none",
      loader: "js",
      minify: true,
      sourcefile: "platform-runtime.js",
      sourcemap: "external",
      target: "es2022",
    }),
    transform(styleSource, {
      charset: "utf8",
      legalComments: "none",
      loader: "css",
      minify: true,
      target: "es2022",
    }),
  ]);
  const cssUrl = "/platform/dev/platform.css";
  const moduleUrl = "/platform/dev/platform.js";
  const moduleMapUrl = `${moduleUrl}.map`;
  const optimizedModuleSource = `${optimizedModule.code}\n//# sourceMappingURL=${moduleMapUrl}\n`;
  const developmentCompression = { gzipLevel: 6, brotliQuality: 4 };
  const assetsByPath = new Map([
    [cssUrl, createAsset(cssUrl, "text/css; charset=utf-8", optimizedStyle.code, developmentCompression)],
    [moduleUrl, createAsset(moduleUrl, "text/javascript; charset=utf-8", optimizedModuleSource, developmentCompression)],
    [moduleMapUrl, createAsset(
      moduleMapUrl,
      "application/json; charset=utf-8",
      optimizedModule.map,
      { compress: false },
    )],
  ]);
  let documentHtml = renderPlatformDocument(
    documentTemplate,
    {
      styleTag: `<link rel="stylesheet" href="${cssUrl}" fetchpriority="high" />`,
      moduleTag: `<script type="module" src="${moduleUrl}" fetchpriority="high"></script>`,
    },
  );
  documentHtml = rewriteDevelopmentStylesheets(
    documentHtml,
    packageRoot,
    normalizedViteOrigin,
  );
  documentHtml = documentHtml.replace(
    "</head>",
    `${createDevelopmentRuntimeScripts(normalizedViteOrigin)}\n  </head>`,
  );

  return Object.freeze({
    documentHtml,
    cssPath: cssUrl,
    modulePath: moduleUrl,
    metrics: Object.freeze({
      sourceBytes:
        Buffer.byteLength(documentTemplate)
        + Buffer.byteLength(styleSource)
        + Buffer.byteLength(moduleSource),
      documentBytes: Buffer.byteLength(documentHtml),
      cssBytes: Buffer.byteLength(optimizedStyle.code),
      moduleBytes: Buffer.byteLength(optimizedModuleSource),
      cssBrotliBytes: assetsByPath.get(cssUrl).variants.br.byteLength,
      moduleBrotliBytes: assetsByPath.get(moduleUrl).variants.br.byteLength,
    }),
    handleRequest(req, res, url) {
      const asset = assetsByPath.get(url.pathname);
      if (!asset || !["GET", "HEAD"].includes(String(req.method || "GET").toUpperCase())) {
        return false;
      }
      if (String(req.headers?.["if-none-match"] || "") === asset.etag) {
        res.writeHead(304, {
          ETag: asset.etag,
          "Cache-Control": "no-cache",
          Vary: "Accept-Encoding",
        });
        res.end();
        return true;
      }
      const requestedEncoding = selectContentEncoding(req.headers?.["accept-encoding"]);
      const encoding = asset.variants[requestedEncoding] ? requestedEncoding : "identity";
      const body = asset.variants[encoding];
      const headers = {
        "Content-Type": asset.contentType,
        "Content-Length": body.byteLength,
        "Cache-Control": "no-cache",
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

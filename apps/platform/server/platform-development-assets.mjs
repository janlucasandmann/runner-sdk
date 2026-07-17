import { extractPlatformDocumentSources } from "./platform-assets.mjs";
import {
  resolveLegacyBrowserSourcePath,
  toViteFileUrl,
} from "../shared/legacy-source-resolution.mjs";
import {
  resolveDevelopmentStyleSourcePaths,
} from "../shared/development-style-resolution.mjs";

function replaceRequiredSource(documentHtml, matcher, replacement, label) {
  if (!matcher.test(documentHtml)) {
    throw new Error(`Platform document is missing its ${label}.`);
  }
  return documentHtml.replace(matcher, replacement);
}

function rewriteDevelopmentStylesheets(documentHtml, packageRoot, viteOrigin) {
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
      .map((sourcePath) => (
        `<link rel="stylesheet" href="${toViteFileUrl(viteOrigin, sourcePath)}" />`
      ))
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
 * Serves the compatibility runtime without an SDK build while rewriting its
 * compiled /dist imports to Vite-served source modules. Typed frontend modules
 * therefore receive Fast Refresh even before the legacy shell is fully retired.
 */
export async function createPlatformDevelopmentAssets(
  inlineDocumentHtml,
  {
    packageRoot,
    viteOrigin,
  },
) {
  const normalizedViteOrigin = String(viteOrigin || "").replace(/\/+$/, "");
  if (!normalizedViteOrigin) {
    throw new Error("Platform development assets require a Vite origin.");
  }
  const { documentHtml: source, cssSource, moduleSource } = extractPlatformDocumentSources(inlineDocumentHtml);
  const rewrittenModuleSource = moduleSource.replace(
    /(["'])(\/dist\/[^"']+)\1/g,
    (match, quote, specifier) => {
      const sourcePath = resolveLegacyBrowserSourcePath(packageRoot, specifier);
      return sourcePath
        ? `${quote}${toViteFileUrl(normalizedViteOrigin, sourcePath)}${quote}`
        : match;
    },
  );
  const cssUrl = "/platform/dev/platform-legacy.css";
  const moduleUrl = "/platform/dev/platform-legacy.js";
  const assetsByPath = new Map([
    [cssUrl, {
      contentType: "text/css; charset=utf-8",
      body: Buffer.from(cssSource),
    }],
    [moduleUrl, {
      contentType: "text/javascript; charset=utf-8",
      body: Buffer.from(rewrittenModuleSource),
    }],
  ]);
  let documentHtml = replaceRequiredSource(
    source,
    /<style>[\s\S]*?<\/style>/,
    `<link rel="stylesheet" href="${cssUrl}" />`,
    "inline style block",
  );
  documentHtml = replaceRequiredSource(
    documentHtml,
    /<script type="module">[\s\S]*?<\/script>/,
    `<script type="module" src="${moduleUrl}"></script>`,
    "inline module script",
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
      inlineDocumentBytes: Buffer.byteLength(source),
      documentBytes: Buffer.byteLength(documentHtml),
      cssBytes: Buffer.byteLength(cssSource),
      moduleBytes: Buffer.byteLength(rewrittenModuleSource),
      cssBrotliBytes: 0,
      moduleBrotliBytes: 0,
    }),
    handleRequest(req, res, url) {
      const asset = assetsByPath.get(url.pathname);
      if (!asset || !["GET", "HEAD"].includes(String(req.method || "GET").toUpperCase())) {
        return false;
      }
      res.writeHead(200, {
        "Content-Type": asset.contentType,
        "Content-Length": asset.body.byteLength,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(String(req.method || "GET").toUpperCase() === "HEAD" ? undefined : asset.body);
      return true;
    },
  });
}

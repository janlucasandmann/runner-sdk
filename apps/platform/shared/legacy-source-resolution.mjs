import fs from "node:fs";
import path from "node:path";

function resolveSourceCandidate(basePath) {
  if (fs.existsSync(basePath)) {
    return basePath;
  }
  const parsed = path.parse(basePath);
  const extensionlessPath = parsed.ext === ".js"
    ? path.join(parsed.dir, parsed.name)
    : basePath;
  const candidates = parsed.ext === ".css"
    ? [basePath]
    : [
        `${extensionlessPath}.ts`,
        `${extensionlessPath}.tsx`,
        `${extensionlessPath}.mjs`,
        `${extensionlessPath}.js`,
        path.join(extensionlessPath, "index.ts"),
        path.join(extensionlessPath, "index.tsx"),
        path.join(extensionlessPath, "index.mjs"),
        path.join(extensionlessPath, "index.js"),
      ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

export function resolveLegacyBrowserSourcePath(packageRoot, specifier) {
  const cleanSpecifier = String(specifier || "").split("?")[0];
  if (cleanSpecifier.startsWith("/dist/")) {
    return resolveSourceCandidate(
      path.join(packageRoot, "src", cleanSpecifier.slice("/dist/".length)),
    );
  }
  return null;
}

export function toViteFileUrl(viteOrigin, filePath) {
  const normalizedPath = path.resolve(filePath).split(path.sep).join("/");
  return `${String(viteOrigin || "").replace(/\/+$/, "")}/@fs${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
}

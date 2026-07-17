import path from "node:path";

const PLATFORM_BACKEND_WATCH_ROOT_PATHS = Object.freeze([
  "apps/platform/server",
  "apps/platform/shared",
  "apps/platform/client/legacy",
  "src/platform-services",
  "src/platform-shell",
]);

const SERVER_SOURCE_EXTENSIONS = new Set([".js", ".mjs", ".json"]);
const COMPATIBILITY_SOURCE_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".mjs",
]);

function isInsidePath(candidatePath, rootPath) {
  const relativePath = path.relative(rootPath, candidatePath);
  return relativePath === ""
    || (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));
}

export function createPlatformBackendWatchRoots(packageRoot) {
  return PLATFORM_BACKEND_WATCH_ROOT_PATHS.map((relativePath) => (
    path.resolve(packageRoot, relativePath)
  ));
}

/**
 * Vite owns typed client modules and source CSS. The backend only restarts for
 * server code and fragment-based compatibility sources that must be recomposed
 * in Node. This preserves Fast Refresh for ordinary React edits.
 */
export function shouldReloadPlatformBackend(packageRoot, changedPath) {
  const absolutePath = path.resolve(changedPath);
  const extension = path.extname(absolutePath).toLowerCase();
  const serverRoot = path.resolve(packageRoot, "apps/platform/server");
  const sharedRoot = path.resolve(packageRoot, "apps/platform/shared");
  if (isInsidePath(absolutePath, serverRoot) || isInsidePath(absolutePath, sharedRoot)) {
    return SERVER_SOURCE_EXTENSIONS.has(extension);
  }

  for (const relativeRoot of [
    "apps/platform/client/legacy",
    "src/platform-services",
    "src/platform-shell",
  ]) {
    if (isInsidePath(absolutePath, path.resolve(packageRoot, relativeRoot))) {
      return COMPATIBILITY_SOURCE_EXTENSIONS.has(extension);
    }
  }
  return false;
}

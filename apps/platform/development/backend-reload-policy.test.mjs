import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  createPlatformBackendWatchRoots,
  shouldReloadPlatformBackend,
} from "./backend-reload-policy.mjs";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

assert.equal(createPlatformBackendWatchRoots(packageRoot).length, 5);
assert.equal(
  shouldReloadPlatformBackend(
    packageRoot,
    path.join(packageRoot, "apps/platform/server/index.mjs"),
  ),
  true,
);
assert.equal(
  shouldReloadPlatformBackend(
    packageRoot,
    path.join(packageRoot, "src/platform-services/create-mode/files/source.mjs"),
  ),
  true,
);
assert.equal(
  shouldReloadPlatformBackend(
    packageRoot,
    path.join(packageRoot, "src/platform-services/create-mode/files/page.css"),
  ),
  true,
);
assert.equal(
  shouldReloadPlatformBackend(
    packageRoot,
    path.join(packageRoot, "src/platform-services/develop-mode/client/page.tsx"),
  ),
  false,
);
assert.equal(
  shouldReloadPlatformBackend(
    packageRoot,
    path.join(packageRoot, "src/react/runner-chat.css"),
  ),
  false,
);

console.log("Platform development backend-reload policy contracts passed.");

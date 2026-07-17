import assert from "node:assert/strict";

import createPlatformViteConfig from "../vite.config.mjs";

assert.equal(typeof createPlatformViteConfig, "function");

const developmentConfig = createPlatformViteConfig({
  command: "serve",
  mode: "development",
});
assert.equal(developmentConfig.base, "/");

const productionConfig = createPlatformViteConfig({
  command: "build",
  mode: "production",
});
assert.equal(productionConfig.base, "/platform-client/");

console.log("Platform Vite development and production base contracts passed.");

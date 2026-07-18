import assert from "node:assert/strict";

import createPlatformViteConfig from "../vite.config.mjs";

assert.equal(typeof createPlatformViteConfig, "function");

const developmentConfig = createPlatformViteConfig({
  command: "serve",
  mode: "development",
});
assert.equal(developmentConfig.base, "/");
assert.equal(developmentConfig.appType, "custom");
assert.equal(developmentConfig.build, undefined);
const developmentPlugins = developmentConfig.plugins.flat(Infinity);
assert.equal(
  developmentPlugins.some((plugin) => plugin?.name === "platform-remote-browser-imports"),
  true,
);
const navigationPlugin = developmentPlugins.find(
  (plugin) => plugin?.name === "platform-hmr-only-navigation",
);
assert.ok(navigationPlugin);

let navigationMiddleware = null;
navigationPlugin.configureServer({
  middlewares: {
    use(middleware) {
      navigationMiddleware = middleware;
    },
  },
});
assert.equal(typeof navigationMiddleware, "function");

function createResponseRecorder() {
  return {
    statusCode: 0,
    headers: {},
    ended: false,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end() {
      this.ended = true;
    },
  };
}

const navigationResponse = createResponseRecorder();
let navigationNextCalled = false;
navigationMiddleware(
  {
    method: "GET",
    url: "/create?thread=thread_1",
    headers: { accept: "text/html,application/xhtml+xml" },
  },
  navigationResponse,
  () => {
    navigationNextCalled = true;
  },
);
assert.equal(navigationNextCalled, false);
assert.equal(navigationResponse.statusCode, 307);
assert.equal(
  navigationResponse.headers.Location,
  "http://localhost:4177/?thread=thread_1",
);
assert.equal(navigationResponse.ended, true);

const moduleResponse = createResponseRecorder();
let moduleNextCalled = false;
navigationMiddleware(
  {
    method: "GET",
    url: "/@vite/client",
    headers: { accept: "*/*" },
  },
  moduleResponse,
  () => {
    moduleNextCalled = true;
  },
);
assert.equal(moduleNextCalled, true);
assert.equal(moduleResponse.ended, false);

console.log("Platform Vite HMR-only source-server contracts passed.");

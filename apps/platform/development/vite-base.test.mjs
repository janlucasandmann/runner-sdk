import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

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
const remoteBrowserImportsPlugin = developmentPlugins.find(
  (plugin) => plugin?.name === "platform-remote-browser-imports",
);
assert.ok(remoteBrowserImportsPlugin);
assert.deepEqual(
  remoteBrowserImportsPlugin.resolveId("@tiptap/react"),
  {
    id: "https://esm.sh/@tiptap/react@3.28.0?bundle&external=react,react-dom",
    external: true,
  },
);
assert.deepEqual(
  remoteBrowserImportsPlugin.resolveId("@tiptap/extension-image"),
  {
    id: "https://esm.sh/@tiptap/extension-image@3.28.0?bundle",
    external: true,
  },
);
const platformShellTemplate = readFileSync(
  new URL("../client/legacy/templates/platform-shell.template.html", import.meta.url),
  "utf8",
);
assert.match(
  platformShellTemplate,
  /"@tiptap\/react":\s*"https:\/\/esm\.sh\/@tiptap\/react@3\.28\.0\?bundle&external=react,react-dom"/,
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

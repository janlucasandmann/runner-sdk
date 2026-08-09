import assert from "node:assert/strict";

import {
  createLegacyPlatformApplicationBindings,
  createLegacyPlatformApplicationSources,
} from "./create-legacy-platform-application.mjs";

const config = Object.freeze({
  aiosOrigin: "http://localhost:3001",
  defaultUpstreamOrigin: "https://api.computer-agents.com/v1",
  platformOrigin: "http://localhost:4177",
});

const bindings = createLegacyPlatformApplicationBindings(config);
const sources = createLegacyPlatformApplicationSources(config);
const repeatedSources = createLegacyPlatformApplicationSources(config);

assert.equal(Object.isFrozen(bindings), true);
assert.equal(Object.isFrozen(sources), true);
assert.equal(sources.documentTemplate, repeatedSources.documentTemplate);
assert.equal(sources.styleSource, repeatedSources.styleSource);
assert.equal(sources.moduleSource, repeatedSources.moduleSource);

assert.match(
  sources.documentTemplate,
  /<link\s+data-platform-style\s*\/>/,
);
assert.match(
  sources.documentTemplate,
  /<script\s+type="module"\s+data-platform-module><\/script>/,
);
assert.doesNotMatch(sources.documentTemplate, /<style>/);
assert.doesNotMatch(
  sources.documentTemplate,
  /<script type="module">\s*import\b/,
);
assert.doesNotMatch(
  `${sources.documentTemplate}${sources.styleSource}${sources.moduleSource}`,
  /__PLATFORM_COMPATIBILITY_BINDING_\d{3}__/,
);
assert.ok(Buffer.byteLength(sources.documentTemplate) < 10_000);
assert.ok(Buffer.byteLength(sources.styleSource) > 100_000);
assert.ok(Buffer.byteLength(sources.moduleSource) > 100_000);
assert.match(
  sources.moduleSource,
  /renderAppSidebar\(\)[\s\S]*className: "playground-content-body"[\s\S]*React\.createElement\(React\.Suspense,[\s\S]*fallback: React\.createElement\(PlatformLoadingState,[\s\S]*className: "playground-content-route-loading"/,
);
assert.match(sources.moduleSource, /function openOrganizationAdminPage\(/);
assert.match(
  sources.moduleSource,
  /id: "admin-organization"[\s\S]{0,240}openOrganizationAdminPage\("organization"\)/,
);
assert.doesNotMatch(sources.moduleSource, /id: "configure-resources-label"/);
assert.match(
  sources.styleSource,
  /\.playground-content-body > \.playground-content-route-loading[\s\S]*position: absolute;[\s\S]*inset: 0;/,
);

console.log(
  "Explicit platform document, style, and module source contracts passed.",
);

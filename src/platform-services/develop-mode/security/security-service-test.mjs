import assert from "node:assert/strict";
import fs from "node:fs/promises";

import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";
import {
  createSecurityService,
  SECURITY_APP_SCRIPT_FRAGMENTS,
} from "./index.mjs";

assert.deepEqual(Object.keys(SECURITY_APP_SCRIPT_FRAGMENTS), [
  "navigation",
  "historyRestore",
  "selectedTitle",
  "sidebarEntry",
  "topNavigation",
  "pageView",
  "setupReturnLifecycle",
]);
assert.match(SECURITY_APP_SCRIPT_FRAGMENTS.navigation, /function openDevelopSecurityPage/);
assert.match(SECURITY_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "develop-security"/);
assert.match(SECURITY_APP_SCRIPT_FRAGMENTS.sidebarEntry, /label: "Security Agents"/);
assert.match(SECURITY_APP_SCRIPT_FRAGMENTS.sidebarEntry, /Icon: Shield/);
assert.match(SECURITY_APP_SCRIPT_FRAGMENTS.selectedTitle, /return "Security Agents"/);
assert.match(SECURITY_APP_SCRIPT_FRAGMENTS.topNavigation, /label: "Security Agents"/);
const securitySidebarIcon = () => null;
const securitySidebarEntry = new Function(
  "Shield",
  "activePage",
  "openDevelopSecurityPage",
  `return [${SECURITY_APP_SCRIPT_FRAGMENTS.sidebarEntry}][0];`,
)(securitySidebarIcon, "develop-security", () => undefined);
assert.equal(securitySidebarEntry.Icon, securitySidebarIcon);
assert.equal(securitySidebarEntry.active, true);
assert.match(SECURITY_APP_SCRIPT_FRAGMENTS.pageView, /DevelopSecurityWorkspacePage/);
assert.match(SECURITY_APP_SCRIPT_FRAGMENTS.setupReturnLifecycle, /github_security/);
assert.doesNotThrow(() => new Function(`
  function securityShellHost() {
    ${SECURITY_APP_SCRIPT_FRAGMENTS.navigation}
    const restore = (entry) => { ${SECURITY_APP_SCRIPT_FRAGMENTS.historyRestore} };
    const title = () => { ${SECURITY_APP_SCRIPT_FRAGMENTS.selectedTitle} return ""; };
    ${SECURITY_APP_SCRIPT_FRAGMENTS.topNavigation}
    ${SECURITY_APP_SCRIPT_FRAGMENTS.pageView}
    const entries = [${SECURITY_APP_SCRIPT_FRAGMENTS.sidebarEntry}];
    ${SECURITY_APP_SCRIPT_FRAGMENTS.setupReturnLifecycle}
    return { restore, title, entries };
  }
`));

const compositionSource = await readPlatformCompositionSource();
assert.match(compositionSource, /develop-mode\/security\/index\.mjs/);
assert.match(compositionSource, /Shield, Slash/);
assert.match(compositionSource, /DevelopSecurityWorkspacePage/);
assert.match(compositionSource, /activePage === "develop-security"/);
assert.match(compositionSource, /developAgentServiceEntries:\s*SECURITY_APP_SCRIPT_FRAGMENTS\.sidebarEntry/);
assert.doesNotMatch(compositionSource, /function openDevelopSecurityPage\([\s\S]*function openDevelopSecurityPage\(/);

const styleResolution = await fs.readFile(
  new URL("../../../../apps/platform/shared/development-style-resolution.mjs", import.meta.url),
  "utf8",
);
assert.match(styleResolution, /develop-mode\/security\/client\/page\/security\.css/);

const productionAssetSource = await fs.readFile(
  new URL("../../../../scripts/runner-chat-assets.mjs", import.meta.url),
  "utf8",
);
assert.match(productionAssetSource, /const securityPageCssPath = path\.join/);
assert.match(productionAssetSource, /fs\.readFile\(securityPageCssPath, "utf8"\)/);
assert.match(productionAssetSource, /\$\{securityPageCssText\}\\n\\n\$\{platformPermissionsPageCssText\}/);

const pageSourceUrls = [
  "./client/page/develop-security-workspace-page.tsx",
  "./client/page/security-overview-page.tsx",
  "./client/page/security-presenters.tsx",
  "./client/page/security-repository-detail-page.tsx",
  "./client/page/security-run-detail-page.tsx",
  "./client/page/security-finding-detail-page.tsx",
];
const pageSources = (await Promise.all(
  pageSourceUrls.map((relativePath) => fs.readFile(new URL(relativePath, import.meta.url), "utf8")),
)).join("\n");
for (const sharedPrimitive of [
  "PlatformUiCard",
  "PlatformPrimaryButton",
  "PlatformSecondaryButton",
  "PlatformIconButton",
  "PlatformLoadingState",
  "PlatformCheckbox",
  "PlatformSelector",
]) {
  assert.match(pageSources, new RegExp(`\\b${sharedPrimitive}\\b`));
}
assert.doesNotMatch(pageSources, /<button\b/);
assert.doesNotMatch(pageSources, /develop-security-(?:primary|secondary|danger|icon|link)-button/);

const securityCss = await fs.readFile(
  new URL("./client/page/security.css", import.meta.url),
  "utf8",
);
assert.match(securityCss, /color-scheme:\s*dark/);
assert.doesNotMatch(securityCss, /var\(--playground-surface,\s*#fff\)/);

const proxyCalls = [];
const securityService = createSecurityService({
  proxyUpstreamGet(_req, _res, path) {
    proxyCalls.push({ kind: "get", path });
  },
  proxyUpstreamJsonRequest(_req, _res, path, method) {
    proxyCalls.push({ kind: "json", method, path });
  },
});
function dispatchSecurityRequest(method, path) {
  return securityService.handleRequest(
    { method },
    {},
    new URL(path, "http://platform.test"),
  );
}
assert.equal(dispatchSecurityRequest("GET", "/api/real/security/overview"), true);
assert.deepEqual(proxyCalls.pop(), { kind: "get", path: "/security/overview" });
assert.equal(
  dispatchSecurityRequest("GET", "/api/real/security/repositories/repository%20one?limit=10"),
  true,
);
assert.deepEqual(proxyCalls.pop(), {
  kind: "get",
  path: "/security/repositories/repository%20one",
});
assert.equal(dispatchSecurityRequest("POST", "/api/real/github/security/setup"), true);
assert.deepEqual(proxyCalls.pop(), {
  kind: "json",
  method: "POST",
  path: "/github/security/setup",
});
assert.equal(
  dispatchSecurityRequest("PATCH", "/api/real/security/findings/finding%2Fone"),
  true,
);
assert.deepEqual(proxyCalls.pop(), {
  kind: "json",
  method: "PATCH",
  path: "/security/findings/finding%2Fone",
});
assert.equal(dispatchSecurityRequest("OPTIONS", "/api/real/security/overview"), false);
assert.equal(dispatchSecurityRequest("GET", "/security/overview"), false);

const platformServicesSource = await fs.readFile(
  new URL("../../../../apps/platform/server/platform-services.mjs", import.meta.url),
  "utf8",
);
assert.match(platformServicesSource, /securityService:\s*createSecurityService\(/);
const serviceRoutesSource = await fs.readFile(
  new URL("../../../../apps/platform/server/routes/service-routes.mjs", import.meta.url),
  "utf8",
);
assert.match(serviceRoutesSource, /securityService\.handleRequest\(req, res, url\)/);

console.log("Repository Security ownership, proxy, shell composition, and style contracts passed.");

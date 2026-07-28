import assert from "node:assert/strict";
import fs from "node:fs/promises";

import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";
import {
  createSecurityService,
  SECURITY_APP_SCRIPT_FRAGMENTS,
  createSecurityAppScriptFragments,
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
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.navigation,
  /function openDevelopSecurityPage/,
);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.navigation,
  /options\.forceOverview === true/,
);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.navigation,
  /computer-agents:security-workspace-route-change/,
);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.sidebarEntry,
  /id: "develop-security"/,
);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.sidebarEntry,
  /label: "Security Agents"/,
);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.sidebarEntry,
  /openDevelopSecurityPage\(\{ forceOverview: true \}\)/,
);
assert.match(SECURITY_APP_SCRIPT_FRAGMENTS.sidebarEntry, /Icon: Shield/);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.selectedTitle,
  /return "Security Agents"/,
);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.topNavigation,
  /label: "Security Agents"/,
);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.topNavigation,
  /PlatformVersionLabel/,
);
assert.match(SECURITY_APP_SCRIPT_FRAGMENTS.topNavigation, /PlatformPopup/);
assert.match(SECURITY_APP_SCRIPT_FRAGMENTS.topNavigation, /variant: "minimal"/);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.topNavigation,
  /React\.createElement\(Ellipsis,/,
);
assert.match(SECURITY_APP_SCRIPT_FRAGMENTS.topNavigation, /Resource ID/);
assert.match(SECURITY_APP_SCRIPT_FRAGMENTS.topNavigation, /Documentation/);
assert.match(SECURITY_APP_SCRIPT_FRAGMENTS.topNavigation, /"Delete"/);
assert.match(
  createSecurityAppScriptFragments({
    documentationUrl: "https://example.test/developers/security",
  }).topNavigation,
  /https:\/\/example\.test\/developers\/security/,
);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.topNavigation,
  /resourcesHeaderState\.title/,
);
const securitySidebarIcon = () => null;
const securitySidebarEntry = new Function(
  "Shield",
  "activePage",
  "openDevelopSecurityPage",
  `return [${SECURITY_APP_SCRIPT_FRAGMENTS.sidebarEntry}][0];`,
)(securitySidebarIcon, "develop-security", () => undefined);
assert.equal(securitySidebarEntry.Icon, securitySidebarIcon);
assert.equal(securitySidebarEntry.active, true);
{
  const calls = [];
  const dispatchedEvents = [];
  const securityWindow = {
    location: {
      href: "https://platform.test/?security_repository=repository_1&keep=1",
    },
    history: {
      state: { existing: true },
      pushState(state, _title, url) {
        this.state = state;
        securityWindow.location.href = url.toString();
      },
    },
    dispatchEvent(event) {
      dispatchedEvents.push(event.type);
      return true;
    },
  };
  const openDevelopSecurityPage = new Function(
    "setAccountMenuOpen",
    "setProfileEditorOpen",
    "setSidebarWorkspaceMode",
    "setResourcesHeaderState",
    "setIsAgentVersionsDetailOpen",
    "setActivePage",
    "window",
    "Event",
    `${SECURITY_APP_SCRIPT_FRAGMENTS.navigation}
return openDevelopSecurityPage;`,
  )(
    (value) => calls.push(["account-menu", value]),
    (value) => calls.push(["profile-editor", value]),
    (value) => calls.push(["sidebar-mode", value]),
    (value) => calls.push(["header", value]),
    (value) => calls.push(["versions-detail", value]),
    (value) => calls.push(["active-page", value]),
    securityWindow,
    Event,
  );

  openDevelopSecurityPage({ forceOverview: true });

  const recoveredUrl = new URL(securityWindow.location.href);
  assert.equal(recoveredUrl.searchParams.get("keep"), "1");
  assert.equal(recoveredUrl.searchParams.has("security_repository"), false);
  assert.deepEqual(securityWindow.history.state.developSecurityRoute, {
    kind: "overview",
  });
  assert.deepEqual(dispatchedEvents, [
    "computer-agents:security-workspace-route-change",
  ]);
  assert.deepEqual(calls.at(-1), ["active-page", "develop-security"]);
}
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.pageView,
  /DevelopSecurityWorkspacePage/,
);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.pageView,
  /githubConnectionStatus: githubStatus/,
);
assert.match(SECURITY_APP_SCRIPT_FRAGMENTS.pageView, /viewerIdentity:/);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.pageView,
  /name: hasSessionAuth \? accountName : "Me"/,
);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.pageView,
  /onConnectGitHub: handleGithubAuthConnect/,
);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.pageView,
  /onDisconnectGitHub: handleGithubAuthDisconnect/,
);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.pageView,
  /workspaceTeams: teamPageTeams/,
);
assert.match(SECURITY_APP_SCRIPT_FRAGMENTS.pageView, /onWorkspaceTeamsRequest/);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.pageView,
  /versionsDrawerPortalId: "playground-agent-versions-drawer-root"/,
);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.pageView,
  /onResourcesHeaderChange: setResourcesHeaderState/,
);
assert.match(
  SECURITY_APP_SCRIPT_FRAGMENTS.setupReturnLifecycle,
  /github_security/,
);
assert.doesNotThrow(
  () =>
    new Function(`
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
`),
);

const compositionSource = await readPlatformCompositionSource();
assert.match(compositionSource, /develop-mode\/security\/index\.mjs/);
assert.match(compositionSource, /\bShield\b/);
assert.match(compositionSource, /\bSlash\b/);
assert.match(compositionSource, /DevelopSecurityWorkspacePage/);
assert.match(compositionSource, /activePage === "develop-security"/);
assert.match(
  compositionSource,
  /developAgentServiceEntries:\s*SECURITY_APP_SCRIPT_FRAGMENTS\.sidebarEntry/,
);
assert.doesNotMatch(
  compositionSource,
  /function openDevelopSecurityPage\([\s\S]*function openDevelopSecurityPage\(/,
);

const styleResolution = await fs.readFile(
  new URL(
    "../../../../apps/platform/shared/development-style-resolution.mjs",
    import.meta.url,
  ),
  "utf8",
);
assert.match(
  styleResolution,
  /develop-mode\/security\/client\/page\/security\.css/,
);

const productionAssetSource = await fs.readFile(
  new URL("../../../../scripts/runner-chat-assets.mjs", import.meta.url),
  "utf8",
);
assert.match(productionAssetSource, /const securityPageCssPath = path\.join/);
assert.match(
  productionAssetSource,
  /fs\.readFile\(securityPageCssPath, "utf8"\)/,
);
assert.match(
  productionAssetSource,
  /\$\{developServerDetailPageCssText\}\\n\\n\$\{securityPageCssText\}\\n\\n\$\{evidenceAgentsPageCssText\}\\n\\n\$\{platformPermissionsPageCssText\}/,
);

const pageSourceUrls = [
  "./client/page/develop-security-workspace-page.tsx",
  "./client/page/security-detail-layout.tsx",
  "./client/page/security-overview-page.tsx",
  "./client/page/security-presenters.tsx",
  "./client/page/security-repository-access-settings.tsx",
  "./client/page/security-repository-detail-page.tsx",
  "./client/page/security-repository-sidebar.tsx",
  "./client/page/security-repository-version-control.tsx",
  "./client/page/security-run-detail-page.tsx",
  "./client/page/security-finding-detail-page.tsx",
];
const pageSources = (
  await Promise.all(
    pageSourceUrls.map((relativePath) =>
      fs.readFile(new URL(relativePath, import.meta.url), "utf8"),
    ),
  )
).join("\n");
const repositoryDetailSource = await fs.readFile(
  new URL("./client/page/security-repository-detail-page.tsx", import.meta.url),
  "utf8",
);
const repositorySidebarSource = await fs.readFile(
  new URL("./client/page/security-repository-sidebar.tsx", import.meta.url),
  "utf8",
);
const repositoryVersionControlSource = await fs.readFile(
  new URL(
    "./client/page/security-repository-version-control.tsx",
    import.meta.url,
  ),
  "utf8",
);
for (const sharedPrimitive of [
  "PlatformUiCard",
  "PlatformPrimaryButton",
  "PlatformSecondaryButton",
  "PlatformIconButton",
  "PlatformLoadingState",
  "PlatformCheckbox",
  "PlatformButtonSelector",
  "PlatformSelector",
]) {
  assert.match(pageSources, new RegExp(`\\b${sharedPrimitive}\\b`));
}
assert.doesNotMatch(pageSources, /<button\b/);
assert.doesNotMatch(
  pageSources,
  /Repository monitoring updated|develop-security-callout is-success/,
  "Security mutations must not render persistent success banners.",
);
assert.doesNotMatch(
  pageSources,
  /develop-security-overview-message|GitHub integration details could not be loaded|setMessage\(/,
  "The Security overview must not render persistent lifecycle, status, or integration banners.",
);
assert.doesNotMatch(
  pageSources,
  /id: "permissions", label: "Permissions"/,
  "Repository permissions must be managed from Settings rather than a standalone tab.",
);
assert.match(pageSources, /title="Manage access"/);
assert.match(pageSources, /PlatformRolePermissionsPage/);
assert.match(pageSources, /PlatformVersionHistorySidebar/);
assert.match(pageSources, /PlatformVersionPublishControl/);
assert.match(pageSources, /PlatformVersionSaveDialog/);
assert.match(pageSources, /PlatformDiffViewer/);
assert.match(pageSources, /SecurityDetailPageFrame/);
assert.doesNotMatch(
  repositoryDetailSource,
  /Delete security repository/,
  "Repository deletion must live in the app-header action menu, not Settings.",
);
assert.match(repositoryVersionControlSource, /onActionsOpenChange/);
assert.match(repositoryVersionControlSource, /onDelete/);
assert.match(
  pageSources,
  /<PlatformLoadingState[\s\S]*className="develop-security-detail-loading-state"/,
  "Security detail loading must use the centralized loading-state component.",
);
assert.match(
  pageSources,
  /if \(loading && !hasCurrentDetail\)[\s\S]*<SecurityDetailLoadingState/,
  "Security detail routes must keep the centered detail loading frame mounted.",
);
assert.match(repositoryDetailSource, /id: "runs", label: "Runs"/);
assert.match(
  repositoryDetailSource,
  /function RunsOverview[\s\S]*<PlatformAnalyticsSection/,
  "Runs must use the centralized Agent Runtime analytics section.",
);
assert.match(
  repositoryDetailSource,
  /function RepositoryActivityTable[\s\S]*<PlatformDetailTabBar<SecurityRepositoryTableTab>[\s\S]*\{ id: "runs", label: "Runs" \}[\s\S]*\{ id: "findings", label: "Findings" \}[\s\S]*\{ id: "audit-log", label: "Audit Log" \}/,
  "Runs, findings, and repository audit events must share one centralized table surface.",
);
assert.equal(
  (repositoryDetailSource.match(/emptyState=\{\s*<PlatformEmptyState/g) || [])
    .length,
  3,
  "Every repository activity table view must use the centralized empty-state component.",
);
assert.match(
  repositoryDetailSource,
  /if \(activeTab === "policy"\)[\s\S]*<PolicyEditor[\s\S]*<ThreatModelEditor/,
  "Policy must compose trigger policy and threat-model context on one page.",
);
assert.doesNotMatch(
  repositoryDetailSource,
  /id: "(?:runs-findings|threat-model|audit)", label:/,
  "Repository details must not restore the removed combined, threat-model, or audit pages.",
);
assert.doesNotMatch(
  repositoryDetailSource,
  /activeTab === "(?:threat-model|audit)"/,
  "Threat-model and audit content must be owned by Policy and Runs respectively.",
);
assert.match(pageSources, /<DevelopServerDetailPage/);
assert.match(pageSources, /playground-server-detail-properties-card/);
assert.match(pageSources, /playground-project-overview-sidebar-rows/);
assert.match(pageSources, /ResourceOverviewIdentityCell/);
assert.match(pageSources, /playground-evaluations-detail-owner-value/);
assert.match(repositorySidebarSource, /ariaLabel="Choose repository owner"/);
assert.match(repositorySidebarSource, /PlatformSelector/);
assert.match(
  repositorySidebarSource,
  /<PlatformPrimaryButton[\s\S]*className="develop-security-repository-run-scan"[\s\S]*Run scan/,
  "Run scan must be the primary action at the bottom of the Details sidebar.",
);
assert.doesNotMatch(
  repositoryVersionControlSource,
  /Run scan|onRunScan|runScanDisabled/,
  "Version controls must not duplicate the sidebar-owned Run scan action.",
);
assert.match(pageSources, /onLoadOwnerCandidates/);
assert.doesNotMatch(
  repositorySidebarSource,
  /label="Policy"|label="Threat model"/,
  "Policy and threat-model versions belong in their editors, not the Details sidebar.",
);
assert.doesNotMatch(
  pageSources,
  /develop-security-repository-detail-facts|playground-tasks-detail-facts is-centralized-sidebar-content/,
  "Security sidebar cards must not contain a second legacy fact-card surface.",
);
assert.match(pageSources, /menuDisabled=\{isBusy \|\| !hasChanges\}/);
assert.match(
  pageSources,
  /is-security-agent-server-detail develop-security-resource-detail/,
);
assert.match(
  pageSources,
  /playground-agents-detail-content is-agent-overview-general develop-security-detail-page-frame__content/,
);
assert.doesNotMatch(
  pageSources,
  /develop-security-(?:primary|secondary|danger|icon|link)-button/,
);

const securityCss = await fs.readFile(
  new URL("./client/page/security.css", import.meta.url),
  "utf8",
);
assert.match(securityCss, /color-scheme:\s*dark/);
assert.doesNotMatch(securityCss, /var\(--playground-surface,\s*#fff\)/);
assert.doesNotMatch(
  securityCss,
  /\.develop-security-detail-content\s*\{[^}]*padding/,
  "Security details must inherit the Agent detail content spacing without local padding.",
);
assert.match(
  securityCss,
  /\.develop-security-detail-loading-state\.platform-loading-state\s*\{[^}]*min-height:/,
  "The centralized detail loader must occupy the content viewport so it can remain centered.",
);

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
assert.equal(
  dispatchSecurityRequest("GET", "/api/real/security/overview"),
  true,
);
assert.deepEqual(proxyCalls.pop(), { kind: "get", path: "/security/overview" });
assert.equal(
  dispatchSecurityRequest(
    "GET",
    "/api/real/security/repositories/repository%20one?limit=10",
  ),
  true,
);
assert.deepEqual(proxyCalls.pop(), {
  kind: "get",
  path: "/security/repositories/repository%20one",
});
assert.equal(
  dispatchSecurityRequest("POST", "/api/real/github/security/setup"),
  true,
);
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
assert.equal(
  dispatchSecurityRequest("OPTIONS", "/api/real/security/overview"),
  false,
);
assert.equal(dispatchSecurityRequest("GET", "/security/overview"), false);

const platformServicesSource = await fs.readFile(
  new URL(
    "../../../../apps/platform/server/platform-services.mjs",
    import.meta.url,
  ),
  "utf8",
);
assert.match(
  platformServicesSource,
  /securityService:\s*createSecurityService\(/,
);
const serviceRoutesSource = await fs.readFile(
  new URL(
    "../../../../apps/platform/server/routes/service-routes.mjs",
    import.meta.url,
  ),
  "utf8",
);
assert.match(
  serviceRoutesSource,
  /securityService\.handleRequest\(req, res, url\)/,
);

console.log(
  "Repository Security ownership, proxy, shell composition, and style contracts passed.",
);

import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  ORGANIZATIONS_APP_SCRIPT_FRAGMENTS,
  ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS,
  ORGANIZATIONS_PAGE_CSS,
  ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS,
  ORGANIZATIONS_STYLE_FRAGMENTS,
  createOrganizationsPageScriptFragments,
  createOrganizationsService,
} from "./index.mjs";

assert.deepEqual(Object.keys(ORGANIZATIONS_STYLE_FRAGMENTS), ["billing", "overview"]);
assert.match(ORGANIZATIONS_STYLE_FRAGMENTS.billing, /\.playground-organization-billing-panel/);
assert.match(ORGANIZATIONS_STYLE_FRAGMENTS.overview, /\.playground-organization-overview-hero-intro/);
assert.equal(Object.values(ORGANIZATIONS_STYLE_FRAGMENTS).join(""), ORGANIZATIONS_PAGE_CSS);

assert.match(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.constants, /PLAYGROUND_ORGANIZATION_HEADER/);
assert.match(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.invitationNotifications, /function normalizeOrganizationInvitationNotificationRecord/);
assert.match(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.storage, /function readPlaygroundActiveOrganizationId/);
assert.match(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.roleDefinitions, /PLAYGROUND_ORGANIZATION_ROLE_DEFINITIONS/);
assert.match(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.roleIdentity, /function normalizePlaygroundOrganizationRoleId/);
assert.match(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.rolePermissions, /function createPlaygroundOrganizationRolePermissionSet/);
assert.match(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.organizationIdentity, /function normalizeOrganizationPageRecord/);
assert.match(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.organizationIdentity, /function handleComposerOrganizationChange/);
assert.doesNotThrow(() => new Function(`
  function organizationsDomainHost() {
    ${Object.values(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS).join("\n")}
  }
`));

assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.loading, /async function loadOrganizationPageData/);
assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.administration, /async function handleCreateOrganization/);
assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.administration, /async function handleRenameOrganization/);
assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.membership, /async function handleSendOrganizationInvite/);
assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.membership, /async function handleRemoveOrganizationMember/);
assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.permissions, /function updateOrganizationRolePermissionSet/);
assert.doesNotThrow(() => new Function(`
  function organizationsRuntimeHost() {
    ${Object.values(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS).join("\n")}
  }
`));

assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.billingState, /organizationPageBillingSummary/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.statePrimary, /organizationPageLoadAbortControllerRef/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.stateDialogs, /organizationPageCreateModalOpen/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.roleLifecycle, /setOrganizationPermissionChartAnimationKey/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.tableLifecycle, /organizationOverviewToolbarPopover/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.requestScope, /PLAYGROUND_ORGANIZATION_HEADER/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.workspaceLifecycle, /activeOrganizationResourceScopeKeyRef/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.navigation, /function openOrganizationPage/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.loadLifecycle, /activePage !== "organization"/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.historyCapture, /page: "organization"/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.page === "organization"/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.selectedTitle, /activePage === "organization"/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /function renderOrganizationPageNav/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "organization"/);
assert.doesNotThrow(() => new Function(`
  function organizationsShellHost() {
    ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.billingState}
    ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.statePrimary}
    ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.stateDialogs}
    ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.roleLifecycle}
    ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.tableLifecycle}
    ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.requestScope}
    ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.workspaceLifecycle}
    ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.navigation}
    ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.loadLifecycle}
    const captureHistory = () => {
      ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.historyCapture}
      return null;
    };
    const restoreHistory = (entry) => {
      ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.historyRestore}
    };
    const getTitle = () => {
      ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.selectedTitle}
      return "";
    };
    ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.topNavigation}
    const sidebarEntries = [${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.sidebarEntry}];
    return { captureHistory, restoreHistory, getTitle, sidebarEntries };
  }
`));

const documentationUrl = "https://platform.example.test/developers/organizations";
const pageFragments = createOrganizationsPageScriptFragments({ documentationUrl });
assert.deepEqual(Object.keys(pageFragments), [
  "setup",
  "identityAndBilling",
  "overview",
  "members",
  "resources",
  "rolesAndView",
]);
assert.match(pageFragments.setup, /function renderOrganizationPage/);
assert.match(pageFragments.identityAndBilling, /const renderOrganizationBillingSnapshot/);
assert.match(pageFragments.overview, new RegExp(JSON.stringify(documentationUrl).replace(/[.*+?^\${}()|[\]\\]/g, "\\$&")));
assert.match(pageFragments.members, /const renderMembers/);
assert.match(pageFragments.resources, /const renderOrganizationResources/);
assert.match(pageFragments.rolesAndView, /const renderOrganizationRoles/);
assert.doesNotThrow(() => new Function(Object.values(pageFragments).join("")));

const demoServerSource = await fs.readFile(
  new URL("../../../../examples/demo-server.mjs", import.meta.url),
  "utf8",
);
assert.match(demoServerSource, /from "\.\.\/src\/platform-services\/configure-mode\/organizations\/index\.mjs"/);
assert.match(demoServerSource, /const ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS = createOrganizationsPageScriptFragments\(/);
assert.match(demoServerSource, /const organizationsService = createOrganizationsService\(/);
assert.match(demoServerSource, /organizationsService\.handleRequest\(req, res, url\)/);
assert.match(demoServerSource, /\$\{ORGANIZATIONS_STYLE_FRAGMENTS\.billing\}/);
assert.match(demoServerSource, /\$\{ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS\.organizationIdentity\}/);
assert.match(demoServerSource, /\$\{ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS\.loading\}/);
assert.match(demoServerSource, /\$\{ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS\.setup\}/);
assert.match(demoServerSource, /\$\{ORGANIZATIONS_APP_SCRIPT_FRAGMENTS\.sidebarEntry\}/);
assert.doesNotMatch(demoServerSource, /^\s*\.playground-organization-billing-panel \{/m);
assert.doesNotMatch(demoServerSource, /function normalizeOrganizationPageRecord\(/);
assert.doesNotMatch(demoServerSource, /async function loadOrganizationPageData\(/);
assert.doesNotMatch(demoServerSource, /function openOrganizationPage\(/);
assert.doesNotMatch(demoServerSource, /function renderOrganizationPage\(/);
assert.doesNotMatch(demoServerSource, /function renderOrganizationPageNav\(/);
assert.doesNotMatch(demoServerSource, /const organizationsProxyMatch =/);

const proxyCalls = [];
const organizationsService = createOrganizationsService({
  proxyUpstreamGet: (...args) => proxyCalls.push(["get", ...args]),
  proxyUpstreamJsonRequest: (...args) => proxyCalls.push(["json", ...args]),
});
let handled = organizationsService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/organizations/org%20one/members?includeProfiles=1"),
);
assert.equal(handled, true);
assert.equal(proxyCalls[0]?.[0], "get");
assert.equal(proxyCalls[0]?.[3], "/organizations/org%20one/members?includeProfiles=1");

handled = organizationsService.handleRequest(
  { method: "DELETE", headers: {} },
  {},
  new URL("http://localhost/api/real/organizations/org_1/members/user_1?ignored=1"),
);
assert.equal(handled, true);
assert.equal(proxyCalls[1]?.[0], "json");
assert.equal(proxyCalls[1]?.[3], "/organizations/org_1/members/user_1");
assert.equal(proxyCalls[1]?.[4], "DELETE");

handled = organizationsService.handleRequest(
  { method: "HEAD", headers: {} },
  {},
  new URL("http://localhost/api/real/organizations"),
);
assert.equal(handled, false);
handled = organizationsService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/teams"),
);
assert.equal(handled, false);
assert.throws(
  () => createOrganizationsService({}),
  /Organizations service requires the proxyUpstreamGet adapter/,
);

console.log("Organizations client ownership, browser syntax, and route contracts passed.");

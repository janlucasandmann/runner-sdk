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
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

assert.deepEqual(Object.keys(ORGANIZATIONS_STYLE_FRAGMENTS), [
  "accessControl",
  "billing",
  "overview",
]);
assert.match(
  ORGANIZATIONS_STYLE_FRAGMENTS.accessControl,
  /\.organization-access-control/,
);
assert.match(ORGANIZATIONS_STYLE_FRAGMENTS.billing, /\.playground-organization-billing-panel/);
assert.match(ORGANIZATIONS_STYLE_FRAGMENTS.overview, /\.playground-team-page\.is-organization-overview-page/);
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
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.tableLifecycle, /organizationMemberToolbarPopover/);
assert.doesNotMatch(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.tableLifecycle, /organizationOverviewToolbarPopover/);
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
  "identityAccess",
  "overview",
  "members",
  "resources",
  "rolesAndView",
]);
assert.match(pageFragments.setup, /function renderOrganizationPage/);
assert.match(pageFragments.identityAndBilling, /const renderOrganizationBillingSnapshot/);
assert.match(
  pageFragments.identityAccess,
  /React\.createElement\(\s*OrganizationAccessControlPage/,
);
assert.match(pageFragments.identityAccess, /PLAYGROUND_ORGANIZATION_HEADER/);
assert.match(pageFragments.overview, new RegExp(JSON.stringify(documentationUrl).replace(/[.*+?^\${}()|[\]\\]/g, "\\$&")));
assert.match(pageFragments.overview, /const organizationOverviewRows =/);
assert.match(pageFragments.overview, /React\.createElement\(OrganizationsOverviewPage/);
assert.match(pageFragments.members, /const renderMembers/);
assert.doesNotMatch(pageFragments.members, /normalizeOrganizationTableSortDirection/);
assert.match(pageFragments.resources, /const renderOrganizationResources/);
assert.match(pageFragments.rolesAndView, /const renderOrganizationRoles/);
assert.match(pageFragments.rolesAndView, /Identity & Access/);
assert.match(pageFragments.rolesAndView, /renderOrganizationIdentityAccess/);
assert.doesNotThrow(() => new Function(Object.values(pageFragments).join("")));
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /playground-organizations-overview-controls/);

const platformEntrySource = await readPlatformCompositionSource();
const platformTemplateBindingsSource = await fs.readFile(
  new URL(
    "../../../../apps/platform/client/legacy/templates/template-bindings.mjs",
    import.meta.url,
  ),
  "utf8",
);
const platformLifecycleSource = await fs.readFile(
  new URL(
    "../../../../apps/platform/client/legacy/domains/shell/controller/application-lifecycle-and-history.template.js",
    import.meta.url,
  ),
  "utf8",
);
assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/configure-mode\/organizations\/index\.mjs"/);
assert.match(platformEntrySource, /const ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS = createOrganizationsPageScriptFragments\(/);
assert.match(platformEntrySource, /organizationsService:\s*createOrganizationsService\(/);
assert.match(platformEntrySource, /organizationsService\.handleRequest\(req, res, url\)/);
assert.match(
  platformTemplateBindingsSource,
  /ORGANIZATIONS_STYLE_FRAGMENTS\.accessControl\s*\+\s*ORGANIZATIONS_STYLE_FRAGMENTS\.billing/,
);
assert.match(platformEntrySource, /\$\{ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS\.organizationIdentity\}/);
assert.match(platformEntrySource, /\$\{ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS\.loading\}/);
assert.match(platformEntrySource, /\$\{ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS\.setup\}/);
assert.match(
  platformLifecycleSource,
  /\$\{ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS\.identityAccess\}/,
);
assert.match(platformEntrySource, /configurePrimaryEntries:[^\n]*ORGANIZATIONS_APP_SCRIPT_FRAGMENTS\.sidebarEntry/);
assert.doesNotMatch(platformEntrySource, /^\s*\.playground-organization-billing-panel \{/m);
assert.doesNotMatch(platformEntrySource, /function normalizeOrganizationPageRecord\(/);
assert.doesNotMatch(platformEntrySource, /async function loadOrganizationPageData\(/);
assert.doesNotMatch(platformEntrySource, /function openOrganizationPage\(/);
assert.doesNotMatch(platformEntrySource, /function renderOrganizationPage\(/);
assert.doesNotMatch(platformEntrySource, /function renderOrganizationPageNav\(/);
assert.doesNotMatch(platformEntrySource, /const organizationsProxyMatch =/);

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
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/identity-connections/idp%20one/group-mappings"),
);
assert.equal(handled, true);
assert.equal(proxyCalls[2]?.[0], "get");
assert.equal(
  proxyCalls[2]?.[3],
  "/identity-connections/idp%20one/group-mappings",
);

handled = organizationsService.handleRequest(
  { method: "POST", headers: {} },
  {},
  new URL("http://localhost/api/real/authorization/approvals/approval_1/resolve"),
);
assert.equal(handled, true);
assert.equal(proxyCalls[3]?.[0], "json");
assert.equal(
  proxyCalls[3]?.[3],
  "/authorization/approvals/approval_1/resolve",
);
assert.equal(proxyCalls[3]?.[4], "POST");

handled = organizationsService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/authorization/decisions?limit=25"),
);
assert.equal(handled, true);
assert.equal(proxyCalls[4]?.[0], "get");
assert.equal(
  proxyCalls[4]?.[3],
  "/authorization/decisions?limit=25",
);

handled = organizationsService.handleRequest(
  { method: "HEAD", headers: {} },
  {},
  new URL("http://localhost/api/real/organizations"),
);
assert.equal(handled, false);
handled = organizationsService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/authorization-secrets"),
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

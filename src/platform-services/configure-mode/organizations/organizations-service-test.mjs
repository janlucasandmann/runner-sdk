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
  "general",
  "members",
  "subscription",
]);
assert.match(
  ORGANIZATIONS_STYLE_FRAGMENTS.accessControl,
  /\.organization-access-control/,
);
assert.match(ORGANIZATIONS_STYLE_FRAGMENTS.billing, /\.playground-organization-billing-panel/);
assert.match(ORGANIZATIONS_STYLE_FRAGMENTS.general, /\.playground-organization-general/);
assert.match(ORGANIZATIONS_STYLE_FRAGMENTS.general, /\.playground-organization-settings-card/);
assert.match(ORGANIZATIONS_STYLE_FRAGMENTS.general, /\.playground-organization-settings-danger-row/);
assert.match(ORGANIZATIONS_STYLE_FRAGMENTS.members, /\.playground-organization-members-card/);
assert.match(ORGANIZATIONS_STYLE_FRAGMENTS.members, /\.playground-organization-members-controls/);
assert.match(
  ORGANIZATIONS_STYLE_FRAGMENTS.subscription,
  /\.playground-organization-subscription-card/,
);
assert.match(
  ORGANIZATIONS_STYLE_FRAGMENTS.subscription,
  /\.playground-organization-subscription-progress-value/,
);
assert.match(
  ORGANIZATIONS_STYLE_FRAGMENTS.subscription,
  /\.playground-organization-subscription-plan-name \{[\s\S]*?font-weight:\s*400;/,
);
assert.match(
  ORGANIZATIONS_STYLE_FRAGMENTS.subscription,
  /\.playground-organization-plan-chooser \{[\s\S]*?position:\s*fixed;[\s\S]*?inset:\s*0;[\s\S]*?background:/,
  "The subscription chooser must be a dark full-page overlay.",
);
assert.match(
  ORGANIZATIONS_STYLE_FRAGMENTS.subscription,
  /\.playground-organization-plan-chooser-grid \{[\s\S]*?border-bottom:\s*1px solid rgba\(255, 255, 255, 0\.1\);/,
  "The plan grid must be separated from the chooser footer.",
);
assert.match(
  ORGANIZATIONS_STYLE_FRAGMENTS.subscription,
  /\.playground-organization-plan-chooser-card\.is-current \.playground-organization-plan-chooser-card-accent \{[\s\S]*?background:\s*rgba\(255, 255, 255, 0\.1\);/,
  "The current-plan label must use the neutral label treatment.",
);
assert.match(
  ORGANIZATIONS_STYLE_FRAGMENTS.subscription,
  /\.playground-organization-plan-chooser-action\.is-current[\s\S]*?background:\s*rgba\(255, 255, 255, 0\.05\)\s*!important;/,
  "The current-plan action must use a subtle neutral background.",
);
assert.match(
  ORGANIZATIONS_STYLE_FRAGMENTS.subscription,
  /\.playground-organization-plan-chooser-shell::before,[\s\S]*?width:\s*100vw;[\s\S]*?border-width:\s*1px 0;/,
  "The chooser shell top and bottom rules should reach the viewport edges horizontally.",
);
assert.match(
  ORGANIZATIONS_STYLE_FRAGMENTS.subscription,
  /\.playground-organization-plan-chooser-shell::after\s*\{[\s\S]*?height:\s*100vh;[\s\S]*?border-width:\s*0 1px;/,
  "The chooser shell side rules should continue vertically across the viewport.",
);
assert.match(
  ORGANIZATIONS_STYLE_FRAGMENTS.subscription,
  /\.playground-organization-plan-chooser-shell \{[\s\S]*?border:\s*0;[\s\S]*?background:/,
  "The shell should rely on the viewport-spanning frame lines instead of a duplicate border.",
);
assert.match(
  ORGANIZATIONS_STYLE_FRAGMENTS.subscription,
  /\.playground-organization-plan-chooser-shell::before,[\s\S]*?border-color:\s*rgba\(255, 255, 255, 0\.05\);/,
  "The chooser frame lines should use the white 5% treatment.",
);
assert.match(
  ORGANIZATIONS_STYLE_FRAGMENTS.subscription,
  /\.playground-organization-plan-chooser-shell \{[\s\S]*?width:\s*min\(1480px, 100%\);/,
  "The chooser shell should retain its centered max width.",
);
assert.match(
  ORGANIZATIONS_STYLE_FRAGMENTS.subscription,
  /\.playground-organization-plan-chooser-catalog-header::after\s*\{[\s\S]*?right:\s*50%;[\s\S]*?background:\s*rgba\(255, 255, 255, 0\.075\);/,
  "The catalog header should divide the Team and Enterprise columns.",
);
assert.doesNotMatch(
  ORGANIZATIONS_STYLE_FRAGMENTS.subscription,
  /\.playground-organization-plan-chooser-intro \{[\s\S]*?min-height:\s*238px;/,
);
assert.doesNotMatch(
  ORGANIZATIONS_STYLE_FRAGMENTS.subscription,
  /\.playground-organization-plan-chooser-catalog-header \{[\s\S]*?min-height:\s*238px;/,
);
assert.match(
  ORGANIZATIONS_STYLE_FRAGMENTS.subscription,
  /\.playground-organization-plan-chooser-footer-cell \+ \.playground-organization-plan-chooser-footer-cell \{[\s\S]*?border-left:\s*1px solid rgba\(255, 255, 255, 0\.1\);/,
  "The chooser footer must retain the three-column separators.",
);
assert.match(
  ORGANIZATIONS_STYLE_FRAGMENTS.members,
  /\.playground-organization-members-card \.platform-data-table\.is-minimalistic-ui \.platform-data-table__footer,[\s\S]*?border-top: 0;[\s\S]*?background: transparent;/,
);
assert.equal(Object.values(ORGANIZATIONS_STYLE_FRAGMENTS).join(""), ORGANIZATIONS_PAGE_CSS);

assert.match(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.constants, /PLAYGROUND_ORGANIZATION_HEADER/);
assert.match(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.invitationNotifications, /function normalizeOrganizationInvitationNotificationRecord/);
assert.match(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.storage, /function readPlaygroundActiveOrganizationId/);
assert.match(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.roleDefinitions, /PLAYGROUND_ORGANIZATION_ROLE_DEFINITIONS/);
assert.match(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.roleIdentity, /function normalizePlaygroundOrganizationRoleId/);
assert.match(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.rolePermissions, /function createPlaygroundOrganizationRolePermissionSet/);
assert.match(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.organizationIdentity, /function normalizeOrganizationPageRecord/);
assert.match(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.organizationIdentity, /function isOrganizationPagePersonalOrganization/);
assert.match(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS.organizationIdentity, /function handleComposerOrganizationChange/);
assert.doesNotThrow(() => new Function(`
  function organizationsDomainHost() {
    ${Object.values(ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS).join("\n")}
  }
`));

assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.loading, /async function loadOrganizationPageData/);
assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.loading, /async function fetchOrganizationPageMemberProfilePayload/);
assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.loading, /\/member-profiles\/lookup/);
assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.administration, /async function handleCreateOrganization/);
assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.administration, /async function handleRenameOrganization/);
assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.administration, /async function handleTransferOrganizationOwnership/);
assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.administration, /\/transfer-ownership/);
assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.administration, /async function handleDeleteOrganization/);
assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.administration, /Personal organizations cannot be deleted/);
assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.administration, /method: "DELETE"/);
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
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.stateDialogs, /organizationPageDeleteModalOpen/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.stateDialogs, /organizationSubscriptionPlanChooserOpen/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.stateDialogs, /organizationSubscriptionBillingInterval/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.stateDialogs, /organizationSubscriptionSeatCounts/);
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
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.navigation, /function openOrganizationAdminPage/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.navigation, /setSidebarWorkspaceMode\("admin"\)/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.adminPrimarySidebarEntries, /id: "admin-organization"/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.adminPrimarySidebarEntries, /id: "admin-members"/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.adminSubscriptionSidebarEntries, /label: "Subscription"/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.adminSubscriptionSidebarEntries, /id: "admin-subscription"/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.adminSubscriptionSidebarEntries, /id: "admin-billing"/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.adminSubscriptionSidebarEntries, /id: "admin-usage"/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.adminPermissionsSidebarEntries, /label: "Permissions"/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.adminPermissionsSidebarEntries, /id: "admin-roles"/);
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.adminPermissionsSidebarEntries, /id: "admin-identity-access"/);
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
    const sidebarEntries = [
      ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.adminPrimarySidebarEntries}
      ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.adminSubscriptionSidebarEntries}
      ${ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.adminPermissionsSidebarEntries}
    ];
    return { captureHistory, restoreHistory, getTitle, sidebarEntries };
  }
`));

const pageFragments = createOrganizationsPageScriptFragments();
assert.deepEqual(Object.keys(pageFragments), [
  "setup",
  "subscription",
  "identityAndBilling",
  "identityAccess",
  "members",
  "rolesAndView",
]);
assert.match(pageFragments.setup, /function renderOrganizationPage/);
assert.match(pageFragments.subscription, /const renderOrganizationSubscription/);
assert.match(pageFragments.subscription, /React\.createElement\(PlatformToggle/);
assert.match(pageFragments.subscription, /handleSettingsUsageBillingSave/);
assert.match(pageFragments.subscription, /Included monthly allowance/);
assert.match(pageFragments.subscription, /Pay-as-you-go spending limit/);
assert.match(pageFragments.subscription, /isEnterprisePlan \? "Manage" : "Upgrade"/);
assert.match(pageFragments.subscription, /className: "playground-organization-plan-chooser"/);
assert.match(pageFragments.subscription, /className: "playground-organization-plan-chooser-shell"/);
assert.match(pageFragments.subscription, /className: "playground-organization-plan-chooser-runner-logo"/);
assert.match(pageFragments.subscription, /className: "playground-organization-plan-chooser-footer"/);
assert.match(pageFragments.subscription, /React\.createElement\("span", null, "Back"\)/);
assert.match(pageFragments.subscription, /src: RUNNER_TRANSPARENT_LOGO_URL/);
assert.match(pageFragments.subscription, /React\.createElement\(PlatformSwitch/);
assert.match(pageFragments.subscription, /builderSeats: seatCount/);
assert.doesNotMatch(pageFragments.subscription, /Your current interval is preserved when switching plans/);
assert.doesNotMatch(pageFragments.subscription, /React\.createElement\("span", null, "Billing period"\)/);
assert.doesNotMatch(pageFragments.subscription, /playground-organization-plan-chooser-close/);
assert.match(pageFragments.subscription, /const canAdjustSeats = includedSeats != null/);
assert.match(pageFragments.subscription, /const canUpdateCurrentSeats = isCurrentPlan && candidatePlan\.id === "enterprise"/);
assert.match(pageFragments.subscription, /handleSettingsChangePlan\(candidatePlan\.id, \{ builderSeats: seatCount \}\)/);
assert.match(pageFragments.subscription, /playground-organization-plan-chooser-action[\s\S]*is-current/);
assert.match(pageFragments.subscription, /createPortal\(/);
assert.match(pageFragments.identityAndBilling, /const renderOrganizationBillingSection/);
assert.match(pageFragments.identityAndBilling, /organizationPageProviderBilling/);
assert.match(pageFragments.identityAndBilling, /organizationPageBillingDocuments/);
assert.match(pageFragments.identityAndBilling, /Add payment method/);
assert.match(pageFragments.identityAndBilling, /Billing information/);
assert.match(pageFragments.identityAndBilling, /Automatic billing/);
assert.match(pageFragments.identityAndBilling, /No invoices yet/);
assert.match(pageFragments.identityAndBilling, /React\.createElement\(PlatformDataTable/);
assert.match(pageFragments.identityAndBilling, /variant: "minimalistic-ui"/);
assert.match(pageFragments.identityAndBilling, /pageSize: 5/);
assert.doesNotMatch(pageFragments.identityAndBilling, /setOrganizationPageBillingPage/);
assert.match(pageFragments.identityAndBilling, /openOrganizationBillingProviderUrl/);
assert.match(
  pageFragments.identityAccess,
  /React\.createElement\(\s*OrganizationAccessControlPage/,
);
assert.match(pageFragments.members, /Manage your organization members, roles, and subscriptions/);
assert.match(pageFragments.members, /Organization Members/);
assert.match(pageFragments.members, /React\.createElement\(PlatformDetailTabBar/);
assert.match(pageFragments.members, /React\.createElement\(PlatformSearch/);
assert.match(pageFragments.members, /React\.createElement\(PlatformSelector/);
assert.match(pageFragments.members, /React\.createElement\(PlatformEmptyState/);
assert.doesNotMatch(pageFragments.members, /organizationMemberRoleFilter/);
assert.match(pageFragments.members, /pagination:/);
assert.match(pageFragments.identityAccess, /PLAYGROUND_ORGANIZATION_HEADER/);
assert.match(pageFragments.members, /const renderMembers/);
assert.doesNotMatch(pageFragments.members, /normalizeOrganizationTableSortDirection/);
assert.match(
  ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.loading,
  /\/members\?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account/,
);
assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.loading, /mergeTeamPageMemberProfiles/);
assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.loading, /organizationMemberProfilesPayload/);
assert.match(pageFragments.rolesAndView, /const renderOrganizationRoles/);
assert.match(pageFragments.rolesAndView, /React\.createElement\(PlatformOwnerSelector/);
assert.match(pageFragments.rolesAndView, /Choose organization owner/);
assert.match(pageFragments.rolesAndView, /roleKicker:\s*null/);
assert.match(pageFragments.rolesAndView, /roleDescription:\s*selectedRoleDefinition\.description/);
assert.doesNotMatch(
  pageFragments.rolesAndView,
  /label:\s*role\.label,\s*description:\s*role\.description,\s*meta:/,
  "The Admin Roles sidebar must not render role description subtitles.",
);
assert.match(
  pageFragments.rolesAndView,
  /normalizedOrganizationAdminPage !== "billing"\s*&& normalizedOrganizationAdminPage !== "roles"\s*\? React\.createElement\("div", \{ className: "playground-team-detail-header" \}/,
  "The Admin Roles page must not render the redundant in-page title and organization subtitle.",
);
assert.match(pageFragments.rolesAndView, /const renderOrganizationGeneral/);
assert.match(pageFragments.rolesAndView, /Your Organization/);
assert.match(pageFragments.rolesAndView, /React\.createElement\(PlatformButtonSelector/);
assert.match(pageFragments.rolesAndView, /Switch Organization/);
assert.match(pageFragments.rolesAndView, /Create organization/);
assert.match(pageFragments.rolesAndView, /handleSwitchOrganization/);
assert.match(pageFragments.rolesAndView, /Active members/);
assert.match(pageFragments.rolesAndView, /Organization ID/);
assert.match(pageFragments.rolesAndView, /Danger zone/);
assert.match(pageFragments.rolesAndView, /Personal organizations are permanent and cannot be deleted/);
assert.match(pageFragments.rolesAndView, /PlatformConfirmationModal/);
assert.match(pageFragments.rolesAndView, /Identity & Access/);
assert.match(pageFragments.rolesAndView, /renderOrganizationIdentityAccess/);
assert.doesNotMatch(pageFragments.rolesAndView, /renderOverview/);
assert.doesNotMatch(pageFragments.rolesAndView, /renderOrganizationResources/);
assert.doesNotMatch(pageFragments.rolesAndView, /playground-team-detail-tabs/);
assert.doesNotThrow(() => new Function(Object.values(pageFragments).join("")));
assert.match(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /label: "Admin"/);
assert.match(ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS.administration, /async function handleSwitchOrganization/);
assert.match(ORGANIZATIONS_STYLE_FRAGMENTS.general, /\.playground-organization-settings-title-row/);
assert.match(ORGANIZATIONS_STYLE_FRAGMENTS.general, /\.playground-organization-settings-switcher-footer/);
assert.doesNotMatch(ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.topNavigation, /playground-organizations-overview-controls/);

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
assert.match(
  platformTemplateBindingsSource,
  /ORGANIZATIONS_STYLE_FRAGMENTS\.general\s*\+\s*ORGANIZATIONS_STYLE_FRAGMENTS\.members/,
);
assert.match(
  platformTemplateBindingsSource,
  /ORGANIZATIONS_STYLE_FRAGMENTS\.members\s*\+\s*ORGANIZATIONS_STYLE_FRAGMENTS\.subscription/,
);
assert.match(platformEntrySource, /\$\{ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS\.organizationIdentity\}/);
assert.match(platformEntrySource, /\$\{ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS\.loading\}/);
assert.match(platformEntrySource, /\$\{ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS\.setup\}/);
assert.match(
  platformLifecycleSource,
  /\$\{ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS\.identityAccess\}/,
);
assert.match(
  platformLifecycleSource,
  /\$\{ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS\.subscription\}/,
);
assert.match(
  platformEntrySource,
  /adminEntries: CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS\.adminSidebarEntry[\s\S]*ORGANIZATIONS_APP_SCRIPT_FRAGMENTS\.adminPrimarySidebarEntries[\s\S]*TEAMS_APP_SCRIPT_FRAGMENTS\.adminSidebarEntry[\s\S]*ORGANIZATIONS_APP_SCRIPT_FRAGMENTS\.adminSubscriptionSidebarEntries[\s\S]*ORGANIZATIONS_APP_SCRIPT_FRAGMENTS\.adminPermissionsSidebarEntries/,
);
assert.doesNotMatch(platformLifecycleSource, /ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS\.overview/);
assert.doesNotMatch(platformLifecycleSource, /ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS\.resources/);

const billingControllerSource = await fs.readFile(
  new URL("../../../../apps/platform/client/legacy/domains/shell/controller/bootstrap-account-and-connectors.template.js", import.meta.url),
  "utf8",
);
assert.match(billingControllerSource, /async function handleSettingsSubscribe\(tierId, options = \{\}\)/);
assert.match(billingControllerSource, /billingInterval: options\?\.billingInterval === "annual" \? "annual" : "monthly"/);
assert.match(billingControllerSource, /\? \{ builderSeats: Number\(options\.builderSeats\) \}/);
assert.match(billingControllerSource, /async function handleSettingsChangePlan\(tierId, options = \{\}\)/);
assert.match(billingControllerSource, /const builderSeatPayload = Number\.isInteger\(normalizedBuilderSeats\)/);
assert.match(billingControllerSource, /newTier: tierId,[\s\S]*preview: true,[\s\S]*\.\.\.builderSeatPayload/);
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
  { method: "POST", headers: {} },
  {},
  new URL("http://localhost/api/real/organizations/org_1/member-profiles/lookup"),
);
assert.equal(handled, true);
assert.equal(proxyCalls[5]?.[0], "json");
assert.equal(proxyCalls[5]?.[3], "/organizations/org_1/member-profiles/lookup");
assert.equal(proxyCalls[5]?.[4], "POST");

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

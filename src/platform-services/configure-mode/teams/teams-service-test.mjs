import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  TEAMS_APP_SCRIPT_FRAGMENTS,
  TEAMS_DOMAIN_SCRIPT_FRAGMENTS,
  TEAMS_PAGE_CSS,
  TEAMS_RUNTIME_SCRIPT_FRAGMENTS,
  TEAMS_STYLE_FRAGMENTS,
  createTeamsPageScriptFragments,
  createTeamsService,
} from "./index.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

assert.equal(Object.keys(TEAMS_STYLE_FRAGMENTS).length, 3);
assert.match(TEAMS_STYLE_FRAGMENTS.foundation, /\.playground-team-page/);
assert.match(createTeamsPageScriptFragments().rolesAndView, /PlatformRolePermissionsPage/);
assert.match(TEAMS_STYLE_FRAGMENTS.rolesAndDialogs, /\.playground-team-modal-backdrop/);
assert.match(TEAMS_STYLE_FRAGMENTS.responsive, /@media \(max-width: 900px\)/);
assert.equal(Object.values(TEAMS_STYLE_FRAGMENTS).join(""), TEAMS_PAGE_CSS);

assert.match(TEAMS_DOMAIN_SCRIPT_FRAGMENTS.memberIdentity, /function normalizeTeamPageTeamRecord/);
assert.match(TEAMS_DOMAIN_SCRIPT_FRAGMENTS.memberIdentity, /function getTeamPageProfileImageUrl/);
assert.match(TEAMS_DOMAIN_SCRIPT_FRAGMENTS.memberIdentity, /function buildTeamPageMetadataWithProfileImage/);
assert.match(TEAMS_DOMAIN_SCRIPT_FRAGMENTS.memberIdentity, /function mergeTeamPageMemberProfiles/);
assert.match(TEAMS_DOMAIN_SCRIPT_FRAGMENTS.memberIdentity, /function fetchTeamPageMemberProfilePayload/);
assert.match(TEAMS_DOMAIN_SCRIPT_FRAGMENTS.resourceSharing, /function parseTeamResourceShareMetadata/);
assert.doesNotThrow(() => new Function(`
  function teamsDomainHost() {
    ${Object.values(TEAMS_DOMAIN_SCRIPT_FRAGMENTS).join("\n")}
  }
`));

assert.match(TEAMS_RUNTIME_SCRIPT_FRAGMENTS.loading, /async function loadTeamPageData/);
assert.match(TEAMS_RUNTIME_SCRIPT_FRAGMENTS.membership, /async function handleCreateTeam/);
assert.match(TEAMS_RUNTIME_SCRIPT_FRAGMENTS.administration, /async function handleTeamProfileImageSelection/);
assert.match(TEAMS_RUNTIME_SCRIPT_FRAGMENTS.administration, /async function handleTransferTeamOwnership/);
assert.match(TEAMS_RUNTIME_SCRIPT_FRAGMENTS.administration, /getPlaygroundTeamRoleApiValue\("owner"\)/);
assert.match(TEAMS_RUNTIME_SCRIPT_FRAGMENTS.membership, /async function handleUpdateTeamMemberRole/);
assert.match(TEAMS_RUNTIME_SCRIPT_FRAGMENTS.administration, /async function handleRenameTeam/);
assert.match(TEAMS_RUNTIME_SCRIPT_FRAGMENTS.permissions, /function updateTeamRolePermissionSet/);
assert.match(TEAMS_RUNTIME_SCRIPT_FRAGMENTS.deleteTeam, /async function handleDeleteTeam/);
assert.match(TEAMS_RUNTIME_SCRIPT_FRAGMENTS.sharing, /async function handleCreateTeamResourceShare/);
assert.match(TEAMS_RUNTIME_SCRIPT_FRAGMENTS.sharing, /async function handleUpdateTeamResourceShareAccess/);
assert.match(TEAMS_RUNTIME_SCRIPT_FRAGMENTS.sharing, /async function handleDeleteTeamResourceShare/);
assert.doesNotThrow(() => new Function(`
  function teamsRuntimeHost() {
    ${Object.values(TEAMS_RUNTIME_SCRIPT_FRAGMENTS).join("\n")}
  }
`));

assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.statePrimary, /teamPageLoadAbortControllerRef/);
assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.stateDialogs, /teamPageCreateModalOpen/);
assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.roleLifecycle, /setTeamPermissionChartAnimationKey/);
assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.tableLifecycle, /teamPageMemberToolbarPopover/);
assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.dialogLifecycle, /closeTeamPageShareModal/);
assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.resourceLifecycle, /setTeamPageProjectResourceIndexes/);
assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.navigation, /function openTeamPage/);
assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.loadLifecycle, /activePage !== "team"/);
assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.historyCapture, /page: "team"/);
assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.page === "team"/);
assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.topNavigation, /function renderTeamPageNav/);
assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "team"/);
assert.doesNotThrow(() => new Function(`
  function teamsShellHost() {
    ${TEAMS_APP_SCRIPT_FRAGMENTS.statePrimary}
    ${TEAMS_APP_SCRIPT_FRAGMENTS.stateDialogs}
    ${TEAMS_APP_SCRIPT_FRAGMENTS.roleLifecycle}
    ${TEAMS_APP_SCRIPT_FRAGMENTS.tableLifecycle}
    ${TEAMS_APP_SCRIPT_FRAGMENTS.dialogLifecycle}
    ${TEAMS_APP_SCRIPT_FRAGMENTS.resourceLifecycle}
    ${TEAMS_APP_SCRIPT_FRAGMENTS.navigation}
    ${TEAMS_APP_SCRIPT_FRAGMENTS.loadLifecycle}
    const captureHistory = () => {
      ${TEAMS_APP_SCRIPT_FRAGMENTS.historyCapture}
      return null;
    };
    const restoreHistory = (entry) => {
      ${TEAMS_APP_SCRIPT_FRAGMENTS.historyRestore}
    };
    ${TEAMS_APP_SCRIPT_FRAGMENTS.topNavigation}
    const sidebarEntries = [${TEAMS_APP_SCRIPT_FRAGMENTS.sidebarEntry}];
    return { captureHistory, restoreHistory, sidebarEntries };
  }
`));

const documentationUrl = "https://platform.example.test/developers/teams";
const pageFragments = createTeamsPageScriptFragments({ documentationUrl });
assert.deepEqual(Object.keys(pageFragments), [
  "setup",
  "overview",
  "members",
  "resourcesFoundation",
  "resourcesView",
  "rolesAndView",
]);
assert.match(pageFragments.setup, /function renderTeamPage/);
assert.match(pageFragments.setup, /const teamOverviewRows =/);
assert.match(pageFragments.setup, /React\.createElement\(PlatformProfileImagePicker/);
assert.match(pageFragments.overview, new RegExp(JSON.stringify(documentationUrl).replace(/[.*+?^\${}()|[\]\\]/g, "\\$&")));
assert.match(pageFragments.overview, /React\.createElement\(TeamsOverviewPage/);
assert.match(pageFragments.members, /const renderMembersTab/);
assert.match(pageFragments.members, /variant: "minimalistic-ui"/);
assert.match(pageFragments.members, /title: "All Members"/);
assert.doesNotMatch(pageFragments.members, /playground-team-grid-table-section/);
assert.doesNotMatch(pageFragments.members, /normalizeTeamOverviewSortDirection/);
assert.match(pageFragments.resourcesFoundation, /function buildTeamProjectResourceRows/);
assert.match(pageFragments.resourcesView, /const renderResourcesTab/);
assert.match(pageFragments.resourcesView, /React\.createElement\(PlatformDataTable/);
assert.match(pageFragments.resourcesView, /variant: "minimalistic-ui"/);
assert.doesNotMatch(pageFragments.resourcesView, /newButtonLabel: "Add Resource"/);
assert.match(pageFragments.rolesAndView, /const renderRolesTab/);
assert.match(pageFragments.rolesAndView, /React\.createElement\(TeamDetailPage/);
assert.match(pageFragments.rolesAndView, /React\.createElement\(PlatformProfileImagePicker/);
assert.match(pageFragments.rolesAndView, /React\.createElement\(PlatformSelector/);
assert.match(pageFragments.rolesAndView, /React\.createElement\(PlatformLabel/);
assert.match(pageFragments.rolesAndView, /playground-team-role-assigned-label/);
assert.match(pageFragments.rolesAndView, /className: "playground-team-detail-sidebar-fact playground-team-detail-sidebar-owner-row"/);
assert.match(pageFragments.rolesAndView, /void handleTransferTeamOwnership/);
assert.doesNotMatch(pageFragments.rolesAndView, /cardTitle: "Owner"/);
assert.doesNotMatch(pageFragments.rolesAndView, /cardTitle: "Access"/);
assert.match(pageFragments.rolesAndView, /cardTitle: "Details"/);
assert.match(pageFragments.rolesAndView, /renderTeamSidebarFact\("Creator", teamCreatorValue/);
assert.match(pageFragments.rolesAndView, /React\.createElement\(PlatformPrimaryButton,[\s\S]{0,500}"Invite Member"/);
assert.doesNotMatch(pageFragments.rolesAndView, /cardTitle: "Actions"/);
assert.match(pageFragments.rolesAndView, /React\.createElement\(PlatformButtonSelector/);
assert.match(pageFragments.rolesAndView, /label: "Add Resource"/);
assert.match(pageFragments.rolesAndView, /const teamDetailAppHeaderActions = React\.createElement\(React\.Fragment/);
assert.match(pageFragments.rolesAndView, /appHeaderActionsPortalId: "playground-team-detail-controls"/);
assert.doesNotThrow(() => new Function(Object.values(pageFragments).join("")));
assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.topNavigation, /playground-teams-overview-controls/);
assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.topNavigation, /playground-team-detail-controls/);
assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.topNavigation, /React\.createElement\(PlatformSwitch/);
assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.topNavigation, /ariaLabel: "Team section"/);
assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.topNavigation, /includeSearchDivider: true/);
assert.match(TEAMS_STYLE_FRAGMENTS.foundation, /\.playground-team-detail-sidebar-owner-row[\s\S]*margin-top: 12px;[\s\S]*padding-top: 12px;[\s\S]*border-top: 1px solid rgba\(255, 255, 255, 0\.1\);/);

const platformEntrySource = await readPlatformCompositionSource();
assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/configure-mode\/teams\/index\.mjs"/);
assert.match(platformEntrySource, /const TEAMS_PAGE_SCRIPT_FRAGMENTS = createTeamsPageScriptFragments\(/);
assert.match(platformEntrySource, /teamsService:\s*createTeamsService\(/);
assert.match(platformEntrySource, /teamsService\.handleRequest\(req, res, url\)/);
assert.match(platformEntrySource, /\$\{TEAMS_STYLE_FRAGMENTS\.foundation\}/);
assert.match(platformEntrySource, /\$\{TEAMS_DOMAIN_SCRIPT_FRAGMENTS\.memberIdentity\}/);
assert.match(platformEntrySource, /\$\{TEAMS_RUNTIME_SCRIPT_FRAGMENTS\.loading\}/);
assert.match(platformEntrySource, /\$\{TEAMS_PAGE_SCRIPT_FRAGMENTS\.setup\}/);
assert.match(platformEntrySource, /configurePrimaryEntries:[^\n]*TEAMS_APP_SCRIPT_FRAGMENTS\.sidebarEntry/);
assert.doesNotMatch(platformEntrySource, /^\s*\.playground-team-page \{/m);
assert.doesNotMatch(platformEntrySource, /function getTeamPageApiErrorMessage\(/);
assert.doesNotMatch(platformEntrySource, /async function loadTeamPageData\(/);
assert.doesNotMatch(platformEntrySource, /function openTeamPage\(/);
assert.doesNotMatch(platformEntrySource, /function renderTeamPage\(/);
assert.doesNotMatch(platformEntrySource, /function renderTeamPageNav\(/);
assert.doesNotMatch(platformEntrySource, /function normalizeTeamMemberProfileLookupString\(/);
assert.doesNotMatch(platformEntrySource, /const teamsProxyMatch =/);

function createService(overrides = {}) {
  return createTeamsService({
    fetchUpstreamJsonForProxyExactPath: async () => ({ status: 404, data: {} }),
    hasAiosSession: () => true,
    proxyUpstreamGet: () => {},
    proxyUpstreamJsonRequest: () => {},
    readOptionalApiKey: () => "",
    readRequestBody: async () => ({}),
    sendJson: () => {},
    ...overrides,
  });
}

const proxyCalls = [];
const teamsService = createService({
  proxyUpstreamGet: (...args) => proxyCalls.push(["get", ...args]),
  proxyUpstreamJsonRequest: (...args) => proxyCalls.push(["json", ...args]),
});
let handled = teamsService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/teams/team%20one/members?includeProfiles=1"),
);
assert.equal(handled, true);
assert.equal(proxyCalls[0]?.[0], "get");
assert.equal(proxyCalls[0]?.[3], "/teams/team%20one/members?includeProfiles=1");

handled = teamsService.handleRequest(
  { method: "PATCH", headers: {} },
  {},
  new URL("http://localhost/api/real/teams/team_1?ignored=1"),
);
assert.equal(handled, true);
assert.equal(proxyCalls[1]?.[0], "json");
assert.equal(proxyCalls[1]?.[3], "/teams/team_1");
assert.equal(proxyCalls[1]?.[4], "PATCH");

handled = teamsService.handleRequest(
  { method: "HEAD", headers: {} },
  {},
  new URL("http://localhost/api/real/teams"),
);
assert.equal(handled, false);

handled = teamsService.handleRequest(
  { method: "GET", headers: {} },
  {},
  new URL("http://localhost/api/real/organizations"),
);
assert.equal(handled, false);

const upstreamLookupCalls = [];
let resolveLookupResponse;
const lookupResponse = new Promise((resolve) => {
  resolveLookupResponse = resolve;
});
const profileLookupService = createService({
  readRequestBody: async () => ({
    teamId: "team one",
    members: [
      { userId: "user_1", email: "Member@Example.com" },
      { user: { uid: "user_1", emailAddress: "member@example.com" } },
    ],
  }),
  fetchUpstreamJsonForProxyExactPath: async (...args) => {
    upstreamLookupCalls.push(args);
    return {
      status: 200,
      data: { profiles: [{ id: "user_1", displayName: "Member One" }] },
    };
  },
  sendJson: (_res, status, payload) => {
    resolveLookupResponse({ status, payload });
  },
});
handled = profileLookupService.handleRequest(
  { method: "POST", headers: {} },
  {},
  new URL("http://localhost/api/real/team-member-profiles/lookup"),
);
assert.equal(handled, true);
const lookupResult = await lookupResponse;
assert.equal(lookupResult.status, 200);
assert.equal(lookupResult.payload.profiles[0]?.displayName, "Member One");
assert.equal(lookupResult.payload.source, "/teams/team%20one/member-profiles/lookup");
assert.deepEqual(upstreamLookupCalls[0]?.[3], {
  teamId: "team one",
  emails: ["member@example.com"],
  userIds: ["user_1"],
  memberIds: ["user_1"],
  ids: ["user_1"],
});

let resolveUnauthorized;
const unauthorizedResponse = new Promise((resolve) => {
  resolveUnauthorized = resolve;
});
const unauthorizedService = createService({
  hasAiosSession: () => false,
  readOptionalApiKey: () => "",
  sendJson: (_res, status, payload) => resolveUnauthorized({ status, payload }),
});
handled = unauthorizedService.handleRequest(
  { method: "POST", headers: {} },
  {},
  new URL("http://localhost/api/real/team-member-profiles/lookup"),
);
assert.equal(handled, true);
assert.equal((await unauthorizedResponse).status, 401);

const memberProfileServerSource = await fs.readFile(
  new URL("./server/member-profiles.mjs", import.meta.url),
  "utf8",
);
assert.doesNotMatch(
  memberProfileServerSource,
  /identitytoolkit|FIREBASE_REST_API_KEY|NEXT_PUBLIC_FIREBASE_API_KEY/,
);
assert.throws(
  () => createTeamsService({}),
  /Teams service requires the fetchUpstreamJsonForProxyExactPath adapter/,
);

console.log("Teams client ownership, browser syntax, member-profile lookup, and route contracts passed.");

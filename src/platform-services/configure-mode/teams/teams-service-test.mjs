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

assert.equal(Object.keys(TEAMS_STYLE_FRAGMENTS).length, 3);
assert.match(TEAMS_STYLE_FRAGMENTS.foundation, /\.playground-team-page/);
assert.match(TEAMS_STYLE_FRAGMENTS.rolesAndDialogs, /\.playground-team-role-pages/);
assert.match(TEAMS_STYLE_FRAGMENTS.rolesAndDialogs, /\.playground-team-modal-backdrop/);
assert.match(TEAMS_STYLE_FRAGMENTS.responsive, /@media \(max-width: 900px\)/);
assert.equal(Object.values(TEAMS_STYLE_FRAGMENTS).join(""), TEAMS_PAGE_CSS);

assert.match(TEAMS_DOMAIN_SCRIPT_FRAGMENTS.memberIdentity, /function normalizeTeamPageTeamRecord/);
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
assert.match(TEAMS_APP_SCRIPT_FRAGMENTS.tableLifecycle, /teamOverviewToolbarPopover/);
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
assert.match(pageFragments.overview, new RegExp(JSON.stringify(documentationUrl).replace(/[.*+?^\${}()|[\]\\]/g, "\\$&")));
assert.match(pageFragments.members, /const renderMembersTab/);
assert.match(pageFragments.resourcesFoundation, /function buildTeamProjectResourceRows/);
assert.match(pageFragments.resourcesView, /const renderResourcesTab/);
assert.match(pageFragments.rolesAndView, /const renderRolesTab/);
assert.doesNotThrow(() => new Function(Object.values(pageFragments).join("")));

const demoServerSource = await fs.readFile(
  new URL("../../../../examples/demo-server.mjs", import.meta.url),
  "utf8",
);
assert.match(demoServerSource, /from "\.\.\/src\/platform-services\/configure-mode\/teams\/index\.mjs"/);
assert.match(demoServerSource, /const TEAMS_PAGE_SCRIPT_FRAGMENTS = createTeamsPageScriptFragments\(/);
assert.match(demoServerSource, /const teamsService = createTeamsService\(/);
assert.match(demoServerSource, /teamsService\.handleRequest\(req, res, url\)/);
assert.match(demoServerSource, /\$\{TEAMS_STYLE_FRAGMENTS\.foundation\}/);
assert.match(demoServerSource, /\$\{TEAMS_DOMAIN_SCRIPT_FRAGMENTS\.memberIdentity\}/);
assert.match(demoServerSource, /\$\{TEAMS_RUNTIME_SCRIPT_FRAGMENTS\.loading\}/);
assert.match(demoServerSource, /\$\{TEAMS_PAGE_SCRIPT_FRAGMENTS\.setup\}/);
assert.match(demoServerSource, /\$\{TEAMS_APP_SCRIPT_FRAGMENTS\.sidebarEntry\}/);
assert.doesNotMatch(demoServerSource, /^\s*\.playground-team-page \{/m);
assert.doesNotMatch(demoServerSource, /function getTeamPageApiErrorMessage\(/);
assert.doesNotMatch(demoServerSource, /async function loadTeamPageData\(/);
assert.doesNotMatch(demoServerSource, /function openTeamPage\(/);
assert.doesNotMatch(demoServerSource, /function renderTeamPage\(/);
assert.doesNotMatch(demoServerSource, /function renderTeamPageNav\(/);
assert.doesNotMatch(demoServerSource, /function normalizeTeamMemberProfileLookupString\(/);
assert.doesNotMatch(demoServerSource, /const teamsProxyMatch =/);

function createService(overrides = {}) {
  return createTeamsService({
    extractIdToken: () => "",
    fetchImpl: async () => ({ ok: false, json: async () => ({}) }),
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

assert.throws(
  () => createTeamsService({}),
  /Teams service requires the extractIdToken adapter/,
);

console.log("Teams client ownership, browser syntax, member-profile lookup, and route contracts passed.");

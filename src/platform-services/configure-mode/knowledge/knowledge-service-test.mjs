import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

import { createKnowledgeService } from "./server/index.mjs";
import { normalizeKnowledgeContext } from "./server/knowledge-context.mjs";
import { KNOWLEDGE_APP_SCRIPT_FRAGMENTS } from "./client/shell/index.mjs";
import { PLAYGROUND_KNOWLEDGE_CSS } from "./client/styles/index.mjs";

function createHarness() {
  const calls = [];
  const service = createKnowledgeService({
    proxyUpstreamGet: (...args) => calls.push({ type: "get", args }),
    proxyUpstreamJsonRequest: (...args) => calls.push({ type: "json", args }),
  });
  return { calls, service };
}

test("Knowledge service proxies reads, search, document mutations, and version publication", () => {
  const { calls, service } = createHarness();
  const res = {};
  const requests = [
    ["GET", "/api/real/knowledge?limit=20", "/knowledge?limit=20", "get"],
    ["GET", "/api/real/knowledge/library%201", "/knowledge/library%201", "get"],
    ["POST", "/api/real/knowledge", "/knowledge", "json"],
    ["POST", "/api/real/knowledge/search", "/knowledge/search", "json"],
    ["POST", "/api/real/knowledge/library-1/proposals", "/knowledge/library-1/proposals", "json"],
    ["PATCH", "/api/real/knowledge/library-1/documents/doc-1", "/knowledge/library-1/documents/doc-1", "json"],
    ["POST", "/api/real/knowledge/library-1/versions/version-1/publish", "/knowledge/library-1/versions/version-1/publish", "json"],
  ];
  for (const [method, pathname] of requests) {
    assert.equal(service.handleRequest({ method }, res, new URL(`https://platform.test${pathname}`)), true);
  }
  assert.deepEqual(
    calls.map(({ type, args }) => [type, args[2], args[3]]),
    requests.map(([method, , upstreamPath, type]) => [type, upstreamPath, type === "json" ? method : undefined]),
  );
});

test("Knowledge execution context preserves scoped proposal access and provenance", () => {
  assert.deepEqual(normalizeKnowledgeContext({
    libraryIds: ["knowledge-1"],
    bindings: [{ libraryId: "knowledge-1", versionId: "version-4" }],
    mode: "propose",
    source: "composer",
  }), {
    schemaVersion: "computer_agents_knowledge_context_v1",
    enabled: true,
    libraryIds: ["knowledge-1"],
    bindings: [{ libraryId: "knowledge-1", versionId: "version-4" }],
    mode: "propose",
    source: "composer",
  });
});

test("Knowledge shell owns the complete Configure navigation lifecycle", () => {
  assert.match(KNOWLEDGE_APP_SCRIPT_FRAGMENTS.sidebarEntry, /LibraryBig/);
  assert.match(KNOWLEDGE_APP_SCRIPT_FRAGMENTS.navigation, /openKnowledgeDocumentPage/);
  assert.match(KNOWLEDGE_APP_SCRIPT_FRAGMENTS.historyCapture, /selectedKnowledgeLibraryId/);
  assert.match(KNOWLEDGE_APP_SCRIPT_FRAGMENTS.historyRestore, /openKnowledgePage/);
  assert.match(KNOWLEDGE_APP_SCRIPT_FRAGMENTS.pageView, /KnowledgeWorkspacePage/);
  assert.match(KNOWLEDGE_APP_SCRIPT_FRAGMENTS.pageView, /knowledgeLibraryIds/);
  assert.match(KNOWLEDGE_APP_SCRIPT_FRAGMENTS.pageView, /overviewScope: knowledgeOverviewScope/);
  assert.match(KNOWLEDGE_APP_SCRIPT_FRAGMENTS.pageView, /currentUserId: hasSessionAuth/);
  assert.match(KNOWLEDGE_APP_SCRIPT_FRAGMENTS.pageView, /currentUserAvatarUrl: hasSessionAuth \? accountAvatarUrl/);
  assert.match(KNOWLEDGE_APP_SCRIPT_FRAGMENTS.pageView, /onWorkspaceTeamsRequest/);
  assert.match(KNOWLEDGE_APP_SCRIPT_FRAGMENTS.pageView, /workspaceTeamMembers: teamPageMembers/);
  assert.match(KNOWLEDGE_APP_SCRIPT_FRAGMENTS.pageView, /workspaceTeamMembersTeamId: teamPageSelectedTeamId/);
  assert.match(KNOWLEDGE_APP_SCRIPT_FRAGMENTS.pageView, /onWorkspaceTeamMembersRequest/);
  assert.match(
    KNOWLEDGE_APP_SCRIPT_FRAGMENTS.pageView,
    /const knowledgeOrganization =[^]*?isOrganizationPageActiveOrganization[^]*?getOrganizationPagePersonalOrganization[^]*?activeOrganizationId: knowledgeOrganizationId/,
  );
  assert.match(KNOWLEDGE_APP_SCRIPT_FRAGMENTS.pageView, /onVersionsSidebarOpenChange: setIsAgentVersionsDetailOpen/);
  assert.match(KNOWLEDGE_APP_SCRIPT_FRAGMENTS.topNavigation, /playground-knowledge-title-actions/);
  assert.match(
    KNOWLEDGE_APP_SCRIPT_FRAGMENTS.topNavigation,
    /className: "playground-knowledge-overview-scope-switch"[\s\S]*\{ value: "all", label: "All Libraries" \}[\s\S]*\{ value: "created", label: "Created by me" \}[\s\S]*\{ value: "shared", label: "Shared with me" \}/,
  );
  assert.match(PLAYGROUND_KNOWLEDGE_CSS, /knowledge-detail-page__document-workspace/);
  assert.match(PLAYGROUND_KNOWLEDGE_CSS, /knowledge-document-workspace__title-input/);
  assert.match(PLAYGROUND_KNOWLEDGE_CSS, /knowledge-detail-page\.file-resource-detail-page\.is-settings-tab/);
  assert.match(
    PLAYGROUND_KNOWLEDGE_CSS,
    /knowledge-detail-page\.file-resource-detail-page\.is-settings-tab\.is-access-detail-view[\s\S]{0,160}width:\s*100%;[\s\S]{0,120}max-width:\s*none;/,
  );
  assert.match(
    PLAYGROUND_KNOWLEDGE_CSS,
    /knowledge-detail-page \.knowledge-detail-page__settings-content[\s\S]{0,100}width:\s*100%;[\s\S]{0,100}max-width:\s*none;/,
  );
  assert.match(PLAYGROUND_KNOWLEDGE_CSS, /knowledge-detail-page__settings-sidebar/);
});

test("Knowledge library identity survives browser history and nested access navigation", async () => {
  const platformTemplateSource = await fs.readFile(
    new URL(
      "../../../../apps/platform/client/legacy/templates/platform.template.js",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(
    platformTemplateSource,
    /PLAYGROUND_PLATFORM_NAVIGATION_FIELDS\s*=\s*\[[\s\S]*?"libraryId"[\s\S]*?"libraryName"[\s\S]*?"documentId"[\s\S]*?"documentName"/,
  );
  assert.match(
    KNOWLEDGE_APP_SCRIPT_FRAGMENTS.historyCapture,
    /libraryId:\s*selectedKnowledgeLibraryId[\s\S]*?libraryName:\s*selectedKnowledgeLibraryName/,
  );
  assert.match(
    KNOWLEDGE_APP_SCRIPT_FRAGMENTS.historyRestore,
    /libraryId:\s*entry\.libraryId\s*\|\|\s*""[\s\S]*?libraryName:\s*entry\.libraryName\s*\|\|\s*""/,
  );
});

test("Knowledge service declines unrelated and unsupported requests", () => {
  const { calls, service } = createHarness();
  assert.equal(service.handleRequest({ method: "GET" }, {}, new URL("https://platform.test/api/real/prompts")), false);
  assert.equal(service.handleRequest({ method: "PUT" }, {}, new URL("https://platform.test/api/real/knowledge/library-1")), false);
  assert.deepEqual(calls, []);
});

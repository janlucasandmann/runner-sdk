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
    proxyUpstreamBinaryGet: (...args) => calls.push({ type: "binary", args }),
    proxyUpstreamGet: (...args) => calls.push({ type: "get", args }),
    proxyUpstreamJsonRequest: (...args) => calls.push({ type: "json", args }),
    proxyUpstreamRawRequest: (...args) => calls.push({ type: "raw", args }),
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
    ["POST", "/api/real/knowledge/parse", "/knowledge/parse", "raw"],
    ["POST", "/api/real/knowledge/library-1/cover", "/knowledge/library-1/cover", "raw"],
    ["GET", "/api/real/knowledge/library-1/cover/image?asset=cover-1", "/knowledge/library-1/cover/image?asset=cover-1", "binary"],
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
    requests.map(([method, , upstreamPath, type]) => [
      type,
      upstreamPath,
      type === "json" || type === "raw"
        ? method
        : type === "binary"
          ? { contentType: "image/webp" }
          : undefined,
    ]),
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
  assert.match(KNOWLEDGE_APP_SCRIPT_FRAGMENTS.sidebarEntry, /Icon: KnowledgeSidebarIcon/);
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
  assert.match(PLAYGROUND_KNOWLEDGE_CSS, /knowledge-detail-page__document-workspace\.is-minimalistic-ui/);
  assert.match(
    PLAYGROUND_KNOWLEDGE_CSS,
    /knowledge-detail-page\.file-resource-detail-page\.is-code-tab[\s\S]{0,360}width:\s*100%;[\s\S]{0,220}padding:\s*0;/,
  );
  assert.match(PLAYGROUND_KNOWLEDGE_CSS, /knowledge-detail-page\.file-resource-detail-page\.is-settings-tab/);
  assert.match(
    PLAYGROUND_KNOWLEDGE_CSS,
    /knowledge-detail-page\.file-resource-detail-page\.is-settings-tab\.is-access-detail-view[\s\S]{0,160}width:\s*100%;[\s\S]{0,120}max-width:\s*none;/,
  );
  assert.match(
    PLAYGROUND_KNOWLEDGE_CSS,
    /\.knowledge-detail-page__settings,[\s\S]{0,80}\.knowledge-detail-page__settings-content[\s\S]{0,100}width:\s*100%;[\s\S]{0,100}min-width:\s*0;/,
  );
  assert.match(PLAYGROUND_KNOWLEDGE_CSS, /knowledge-detail-page__settings-sidebar/);
  assert.match(
    PLAYGROUND_KNOWLEDGE_CSS,
    /\.knowledge-library-cover\s*\{[\s\S]{0,180}width:\s*100%;[\s\S]{0,160}height:\s*420px;/,
  );
  assert.match(
    PLAYGROUND_KNOWLEDGE_CSS,
    /\.knowledge-library-cover-crop-modal__title\.platform-modal-header__title\s*\{[\s\S]{0,100}font-size:\s*14px;[\s\S]{0,80}font-weight:\s*400;/,
  );
  assert.match(
    PLAYGROUND_KNOWLEDGE_CSS,
    /\.knowledge-library-cover-crop-modal__zoom::-(?:webkit-slider-thumb|moz-range-thumb)\s*\{[\s\S]{0,180}border:\s*0;[\s\S]{0,160}background:\s*#fff;/,
  );
  assert.match(
    PLAYGROUND_KNOWLEDGE_CSS,
    /\.playground-content-body:has\([\s\S]{0,180}\.knowledge-detail-page\.file-resource-detail-page\.is-code-tab[\s\S]{0,180}overflow-y:\s*auto;/,
  );
  assert.match(
    PLAYGROUND_KNOWLEDGE_CSS,
    /\.knowledge-detail-page__document-workspace\s*\{[\s\S]{0,220}width:\s*min\(100%, var\(--playground-centered-page-max-width, 87\.5rem\)\);[\s\S]{0,180}padding-inline:\s*44px;/,
  );
  assert.match(
    PLAYGROUND_KNOWLEDGE_CSS,
    /\.knowledge-detail-page\.is-general-tab[\s\S]{0,220}\.platform-code-editor-workspace__sidebar\s*\{[\s\S]{0,120}position:\s*sticky;[\s\S]{0,80}top:\s*0;/,
  );
  assert.match(
    PLAYGROUND_KNOWLEDGE_CSS,
    /\.knowledge-document-workspace__body-title:focus-within[\s\S]{0,160}\.knowledge-document-workspace__add-cover-button/,
  );
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
  assert.match(platformTemplateSource, /"originThreadId"[\s\S]*?"originThreadTitle"/);
  assert.match(
    KNOWLEDGE_APP_SCRIPT_FRAGMENTS.historyCapture,
    /libraryId:\s*selectedKnowledgeLibraryId[\s\S]*?libraryName:\s*selectedKnowledgeLibraryName/,
  );
  assert.match(
    KNOWLEDGE_APP_SCRIPT_FRAGMENTS.historyRestore,
    /libraryId:\s*entry\.libraryId\s*\|\|\s*""[\s\S]*?libraryName:\s*entry\.libraryName\s*\|\|\s*""/,
  );
  assert.match(
    KNOWLEDGE_APP_SCRIPT_FRAGMENTS.topNavigation,
    /knowledgeOriginThreadTitle[\s\S]*?returnToKnowledgeOriginThread/,
  );
});

test("Knowledge service declines unrelated and unsupported requests", () => {
  const { calls, service } = createHarness();
  assert.equal(service.handleRequest({ method: "GET" }, {}, new URL("https://platform.test/api/real/prompts")), false);
  assert.equal(service.handleRequest({ method: "PUT" }, {}, new URL("https://platform.test/api/real/knowledge/library-1")), false);
  assert.deepEqual(calls, []);
});

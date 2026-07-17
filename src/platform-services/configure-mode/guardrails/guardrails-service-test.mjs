import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  GUARDRAILS_AGENT_DOMAIN_SCRIPT,
  GUARDRAILS_AGENT_PAGE_SCRIPT,
  GUARDRAILS_AGENT_SCRIPT_FRAGMENTS,
  GUARDRAILS_APP_RUNTIME_SCRIPT,
  GUARDRAILS_APP_SCRIPT_FRAGMENTS,
  GUARDRAILS_APP_STATE_SCRIPT,
  GUARDRAILS_CATALOG_SCRIPT,
  GUARDRAILS_DOMAIN_FRAGMENTS,
  GUARDRAILS_DOMAIN_RUNTIME_SCRIPT,
  GUARDRAILS_PAGE_CSS,
  GUARDRAILS_PAGE_RUNTIME_SCRIPT,
  GUARDRAILS_PAGE_RUNTIME_SCRIPT_FRAGMENTS,
  GUARDRAILS_STYLE_FRAGMENTS,
  createGuardrailsService,
} from "./index.mjs";
import {
  extractProxyAgentGuardrailPayload,
  normalizeProxyGuardrailSetIds,
} from "./server/enrichment.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

assert.match(GUARDRAILS_CATALOG_SCRIPT, /PLAYGROUND_DEFAULT_GUARDRAIL_SETS/);
assert.match(GUARDRAILS_DOMAIN_RUNTIME_SCRIPT, /function normalizePlaygroundGuardrailSet/);
assert.match(GUARDRAILS_DOMAIN_RUNTIME_SCRIPT, /const playgroundGuardrailVersionController/);
assert.match(GUARDRAILS_DOMAIN_FRAGMENTS.runtime, /function buildPlaygroundGuardrailBackendPayload/);
assert.match(GUARDRAILS_PAGE_RUNTIME_SCRIPT_FRAGMENTS.controller, /function renderGuardrailsPage/);
assert.match(GUARDRAILS_PAGE_RUNTIME_SCRIPT_FRAGMENTS.versionActions, /publishCurrentGuardrailVersion/);
assert.match(GUARDRAILS_PAGE_RUNTIME_SCRIPT_FRAGMENTS.versionViews, /renderGuardrailVersionsSidebar/);
assert.match(GUARDRAILS_PAGE_RUNTIME_SCRIPT_FRAGMENTS.table, /function renderGuardrailsTable/);
assert.match(GUARDRAILS_PAGE_RUNTIME_SCRIPT, /function renderGuardrailVersionChangesPage/);
assert.match(GUARDRAILS_APP_STATE_SCRIPT, /guardrailsBackendLoadRef/);
assert.match(GUARDRAILS_APP_RUNTIME_SCRIPT, /async function loadBackendGuardrailSets/);
assert.match(GUARDRAILS_APP_SCRIPT_FRAGMENTS.navigation, /function openGuardrailsPage/);
assert.match(GUARDRAILS_APP_SCRIPT_FRAGMENTS.topNavigation, /function renderGuardrailsPageNav/);
assert.match(GUARDRAILS_APP_SCRIPT_FRAGMENTS.historyCapture, /guardrailId: selectedGuardrailSetId/);
assert.match(GUARDRAILS_APP_SCRIPT_FRAGMENTS.sidebarEntry, /label: "Guardrails"/);
assert.match(GUARDRAILS_AGENT_DOMAIN_SCRIPT, /function buildPlaygroundAgentGuardrailBundle/);
assert.match(GUARDRAILS_AGENT_PAGE_SCRIPT, /const agentGuardrailsSection/);
assert.match(GUARDRAILS_AGENT_PAGE_SCRIPT, /variant: "minimalistic-ui"/);
assert.doesNotMatch(GUARDRAILS_AGENT_PAGE_SCRIPT, /pagination\s*:/);
assert.match(GUARDRAILS_AGENT_SCRIPT_FRAGMENTS.versionDiffPayload, /invisiblePromptAdaptations/);
assert.match(GUARDRAILS_STYLE_FRAGMENTS.page, /\.playground-guardrails-page/);
assert.match(GUARDRAILS_STYLE_FRAGMENTS.versionChanges, /\.playground-guardrails-version-changes-page/);
assert.match(GUARDRAILS_STYLE_FRAGMENTS.agentIntegration, /\.playground-agents-detail-guardrails-section/);
assert.equal(GUARDRAILS_PAGE_CSS, GUARDRAILS_STYLE_FRAGMENTS.page);

[
  GUARDRAILS_CATALOG_SCRIPT,
  GUARDRAILS_DOMAIN_RUNTIME_SCRIPT,
  GUARDRAILS_AGENT_DOMAIN_SCRIPT,
  GUARDRAILS_AGENT_PAGE_SCRIPT,
  GUARDRAILS_APP_STATE_SCRIPT,
  GUARDRAILS_APP_RUNTIME_SCRIPT,
  GUARDRAILS_APP_SCRIPT_FRAGMENTS.navigation,
  GUARDRAILS_APP_SCRIPT_FRAGMENTS.topNavigation,
  GUARDRAILS_PAGE_RUNTIME_SCRIPT,
].forEach((script) => assert.doesNotThrow(() => new Function(script)));

const platformEntrySource = await readPlatformCompositionSource();
assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/configure-mode\/guardrails\/index\.mjs"/);
assert.match(platformEntrySource, /guardrailsService\.handleRequest\(req, res, url\)/);
assert.match(platformEntrySource, /guardrailsService\.enrichThreadPayload/);
assert.match(platformEntrySource, /\$\{GUARDRAILS_PAGE_RUNTIME_SCRIPT\}/);
assert.match(platformEntrySource, /\$\{GUARDRAILS_DOMAIN_FRAGMENTS\.runtime\}/);
assert.match(platformEntrySource, /\$\{GUARDRAILS_AGENT_SCRIPT_FRAGMENTS\.page\}/);
assert.doesNotMatch(platformEntrySource, /function renderGuardrailsPage\(/);
assert.doesNotMatch(platformEntrySource, /function openGuardrailsPage\(/);
assert.doesNotMatch(platformEntrySource, /function normalizePlaygroundGuardrailSet\(/);
assert.doesNotMatch(platformEntrySource, /function normalizeProxyGuardrailSetIds\(/);
assert.doesNotMatch(platformEntrySource, /const guardrailsProxyMatch/);
assert.doesNotMatch(platformEntrySource, /const agentGuardrailsMatch/);
assert.doesNotMatch(platformEntrySource, /^\s*\.playground-guardrails-page\s*\{/m);

const calls = [];
const agentRecord = {
  id: "agent_1",
  guardrailSetIds: ["guardrail_1"],
  guardrails: [{
    id: "guardrail_1",
    name: "Safe changes",
    prompts: [{ id: "prompt_1", title: "Confirm", prompt: "Ask before publishing." }],
  }],
};
const baseAdapters = {
  fetchImpl: async (...args) => {
    calls.push({ adapter: "fetch", args });
    return new Response(JSON.stringify({ agent: agentRecord }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
  fetchAiosApi: async (...args) => {
    calls.push({ adapter: "api", args });
    return new Response(JSON.stringify({ agent: agentRecord }), { status: 200 });
  },
  fetchAiosCloud: async (...args) => {
    calls.push({ adapter: "cloud", args });
    return new Response("", { status: 404 });
  },
  hasAiosSession: () => false,
  proxyUpstreamGet: (...args) => calls.push({ adapter: "get", args }),
  proxyUpstreamJsonRequest: (...args) => calls.push({ adapter: "json", args }),
  warn: (...args) => calls.push({ adapter: "warn", args }),
  withProxyOrganizationHeader: (_req, _body, headers) => headers,
};
const guardrailsService = createGuardrailsService(baseAdapters);

function dispatch(method, pathname) {
  calls.length = 0;
  const req = { method, url: pathname, headers: {} };
  const res = {};
  const handled = guardrailsService.handleRequest(req, res, new URL(pathname, "http://localhost"));
  return { handled, call: calls[0] };
}

let result = dispatch("GET", "/api/real/guardrails");
assert.equal(result.handled, true);
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/guardrails");

result = dispatch("GET", "/api/real/guardrail-sets/set%201/versions");
assert.equal(result.call.args[2], "/guardrails/set%201/versions");

result = dispatch("PUT", "/api/real/guardrails/set_1");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/guardrails/set_1");
assert.equal(result.call.args[3], "PATCH");

result = dispatch("GET", "/api/real/agents/agent%201/guardrails");
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/agents/agent%201/guardrails");

result = dispatch("PATCH", "/api/real/agents/agent_1/guardrails");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[3], "PATCH");

result = dispatch("DELETE", "/api/real/agents/agent_1/guardrails/set%201");
assert.equal(result.call.args[2], "/agents/agent_1/guardrails/set%201");
assert.equal(result.call.args[3], "DELETE");

result = dispatch("GET", "/api/real/agents");
assert.equal(result.handled, false);
assert.equal(result.call, undefined);

result = dispatch("PATCH", "/api/real/agents/agent_1/guardrails/set_1");
assert.equal(result.handled, false);
assert.equal(result.call, undefined);

assert.deepEqual(normalizeProxyGuardrailSetIds(["one", "one", { id: "two" }]), ["one", "two"]);
const extracted = extractProxyAgentGuardrailPayload(agentRecord);
assert.deepEqual(extracted.guardrailSetIds, ["guardrail_1"]);
assert.equal(extracted.promptAdaptations[0].content, "Ask before publishing.");

calls.length = 0;
const payload = { agentId: "agent_1", task: "Ship safely", metadata: { existing: true } };
const enriched = await guardrailsService.enrichThreadPayload(
  { headers: {} },
  "https://runner.example.test/v1",
  "test-key",
  payload,
);
assert.equal(calls[0].adapter, "fetch");
assert.match(calls[0].args[0], /\/agents\/agent_1$/);
assert.deepEqual(enriched.guardrailSetIds, ["guardrail_1"]);
assert.equal(enriched.promptAdaptations[0].content, "Ask before publishing.");
assert.equal(enriched.metadata.existing, true);
assert.equal(enriched.metadata.runnerGuardrails.version, 1);

const untouched = { task: "No selected agent" };
assert.equal(
  await guardrailsService.enrichThreadPayload({ headers: {} }, "https://runner.example.test/v1", "", untouched),
  untouched,
);

assert.throws(
  () => createGuardrailsService({}),
  /proxyUpstreamGet adapter/,
);

console.log("Guardrails service client ownership, route, and enforcement contracts passed.");

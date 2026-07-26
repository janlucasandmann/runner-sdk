import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  EVIDENCE_AGENTS_APP_SCRIPT_FRAGMENTS,
  createEvidenceAgentsService,
} from "./index.mjs";

for (const relativePath of [
  "README.md",
  "index.ts",
  "client/index.ts",
  "client/domain/index.ts",
  "client/page/index.ts",
  "client/page/evidence-agents.css",
  "server/README.md",
]) {
  await fs.access(new URL(relativePath, import.meta.url));
}

assert.match(
  EVIDENCE_AGENTS_APP_SCRIPT_FRAGMENTS.sidebarEntry,
  /id: "develop-evidence-agents"[\s\S]*label: "Evidence Agents"[\s\S]*Icon: LibraryBig/,
);
assert.match(
  EVIDENCE_AGENTS_APP_SCRIPT_FRAGMENTS.navigation,
  /setActivePage\("develop-evidence-agents"\)/,
);
assert.match(
  EVIDENCE_AGENTS_APP_SCRIPT_FRAGMENTS.pageView,
  /DevelopEvidenceAgentsWorkspacePage/,
);

const calls = [];
const service = createEvidenceAgentsService({
  proxyUpstreamGet(_req, _res, path) {
    calls.push({ method: "GET", path });
  },
  proxyUpstreamJsonRequest(_req, _res, path, method) {
    calls.push({ method, path });
  },
});
const response = {};

assert.equal(
  service.handleRequest(
    { method: "GET" },
    response,
    new URL("http://platform.local/api/real/evidence-agents/srv_test/reviews?status=open"),
  ),
  true,
);
assert.equal(
  service.handleRequest(
    { method: "POST" },
    response,
    new URL(
      "http://platform.local/api/real/evidence-agents/srv_test/reviews/REVIEW_1/approve",
    ),
  ),
  true,
);
assert.deepEqual(calls, [
  {
    method: "GET",
    path: "/servers/srv_test/evidence-agents/reviews?status=open",
  },
  {
    method: "POST",
    path: "/servers/srv_test/evidence-agents/reviews/REVIEW_1/approve",
  },
]);

console.log("Evidence Agents service boundary passed.");

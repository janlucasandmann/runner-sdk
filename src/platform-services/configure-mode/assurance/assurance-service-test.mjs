import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  ASSURANCE_APP_SCRIPT_FRAGMENTS,
  PLAYGROUND_ASSURANCE_CSS,
  createAssuranceService,
} from "./index.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

assert.match(PLAYGROUND_ASSURANCE_CSS, /\.assurance-overview-guide/);
assert.match(PLAYGROUND_ASSURANCE_CSS, /\.assurance-detail-page/);
assert.match(ASSURANCE_APP_SCRIPT_FRAGMENTS.state, /selectedAssurancePolicyId/);
assert.match(ASSURANCE_APP_SCRIPT_FRAGMENTS.navigation, /openAssurancePage/);
assert.match(ASSURANCE_APP_SCRIPT_FRAGMENTS.pageView, /AssuranceWorkspacePage/);
assert.match(ASSURANCE_APP_SCRIPT_FRAGMENTS.sidebarEntry, /label: "Assurance"/);

const platformSource = await readPlatformCompositionSource();
assert.match(
  platformSource,
  /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/configure-mode\/assurance\/index\.mjs"/,
);
assert.match(
  platformSource,
  /assuranceService\.handleRequest\(req, res, url\)/,
);
assert.match(
  platformSource,
  /ASSURANCE_APP_SCRIPT_FRAGMENTS/,
);
assert.match(
  platformSource,
  /PLAYGROUND_ASSURANCE_CSS/,
);

assert.throws(
  () => createAssuranceService({}),
  /requires the proxyUpstreamJsonRequest adapter/,
);

const calls = [];
const service = createAssuranceService({
  proxyUpstreamJsonRequest: (...args) => calls.push(args),
});
const request = {
  method: "POST",
  url: "/api/real/assurance/runs/run_1/evaluate?source=mission-control",
  headers: {},
};
assert.equal(
  service.handleRequest(
    request,
    {},
    new URL(request.url, "http://localhost"),
  ),
  true,
);
assert.equal(calls.length, 1);
assert.equal(
  calls[0][2],
  "/assurance/runs/run_1/evaluate?source=mission-control",
);
assert.equal(calls[0][3], "POST");
assert.equal(
  service.handleRequest(
    { method: "GET", url: "/api/real/test-plans", headers: {} },
    {},
    new URL("http://localhost/api/real/test-plans"),
  ),
  false,
);

const detailSource = await fs.readFile(
  new URL("./client/page/assurance-policy-detail-page.tsx", import.meta.url),
  "utf8",
);
assert.match(detailSource, /ResourceDetailPage/);
assert.match(detailSource, /PlatformDataTable/);
assert.match(detailSource, /PlatformUiCard/);
assert.match(detailSource, /AssurancePolicyAccessSettings/);
assert.match(detailSource, /createVersion/);
assert.match(detailSource, /publishVersion/);

const runSource = await fs.readFile(
  new URL("./client/page/assurance-run-detail-page.tsx", import.meta.url),
  "utf8",
);
assert.match(runSource, /evidenceFingerprint/);
assert.match(runSource, /PlatformConfirmationModal/);
assert.match(runSource, /approveRun/);
assert.match(runSource, /Audit Log/);

const workspaceSource = await fs.readFile(
  new URL("./client/page/assurance-workspace-page.tsx", import.meta.url),
  "utf8",
);
assert.match(workspaceSource, /PlatformLoadingState/);
assert.match(workspaceSource, /AssurancePolicyCreateModal/);
assert.match(workspaceSource, /AssuranceRunCreateModal/);

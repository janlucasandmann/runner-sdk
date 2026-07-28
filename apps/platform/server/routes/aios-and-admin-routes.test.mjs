import assert from "node:assert/strict";

import { createAiosAndAdminRoutes } from "./aios-and-admin-routes.mjs";

const proxiedRequests = [];
const service = {
    handleRequest() {
        return false;
    },
};
const handleRoute = createAiosAndAdminRoutes({
    assuranceService: service,
    evaluationsService: service,
    fineTuningService: service,
    testsService: service,
    handleAiosUserSessionRequest() {},
    proxyAiosJsonRequest(_req, _res, upstreamPath, method) {
        proxiedRequests.push({ upstreamPath, method });
    },
    proxyAiosLatestBriefingHtml() {},
    proxyAiosNotionLoginRequest() {},
    proxyContactSalesSummaryGet() {},
    proxyFeedbackSummaryGet() {},
    proxyPlaygroundCustomSkills() {},
    proxyProductUsageSummaryGet() {},
});

for (const [method, pathname, expectedUpstreamPath] of [
    ["GET", "/api/aios/projects/project-1/skills", "/api/projects/project-1/skills"],
    ["POST", "/api/aios/projects/project-1/skills", "/api/projects/project-1/skills"],
    ["PATCH", "/api/aios/projects/project-1/skills/skill-1", "/api/projects/project-1/skills/skill-1"],
    ["GET", "/api/aios/projects/project-1/skills/skill-1/versions", "/api/projects/project-1/skills/skill-1/versions"],
    ["PATCH", "/api/aios/projects/project-1/skills/skill-1/versions/version-1", "/api/projects/project-1/skills/skill-1/versions/version-1"],
    ["DELETE", "/api/aios/projects/project-1/skills/skill-1/versions/version-1", "/api/projects/project-1/skills/skill-1/versions/version-1"],
]) {
    const handled = handleRoute(
        { method },
        {},
        new URL(`http://localhost${pathname}`),
    );
    assert.equal(handled, true);
    assert.deepEqual(proxiedRequests.pop(), {
        upstreamPath: expectedUpstreamPath,
        method,
    });
}

assert.equal(
    handleRoute(
        { method: "POST" },
        {},
        new URL("http://localhost/api/aios/projects/project-1/not-skills"),
    ),
    false,
);

console.log("aiOS project skill proxy route contracts passed.");

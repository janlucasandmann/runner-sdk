import assert from "node:assert/strict";

import { createAiosAndAdminRoutes } from "./aios-and-admin-routes.mjs";

const proxiedRequests = [];
let applianceOverviewRequests = 0;
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
    proxyApplianceOverviewGet() {
        applianceOverviewRequests += 1;
    },
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

assert.equal(
    handleRoute(
        { method: "GET" },
        {},
        new URL("http://localhost/api/real/admin/appliance-overview"),
    ),
    true,
);
assert.equal(applianceOverviewRequests, 1);

for (const [method, pathname, expectedUpstreamPath] of [
    [
        "GET",
        "/api/aios/notion/strategy-sync?projectId=project-1&databaseId=database-1",
        "/api/notion/strategy-sync?projectId=project-1&databaseId=database-1",
    ],
    [
        "GET",
        "/api/aios/notion/strategy-sync?libraryId=library-1&databaseId=database-1",
        "/api/notion/strategy-sync?libraryId=library-1&databaseId=database-1",
    ],
    ["PUT", "/api/aios/notion/strategy-sync", "/api/notion/strategy-sync"],
    [
        "GET",
        "/api/aios/confluence/strategy-sync?libraryId=library-1&spaceId=space-1",
        "/api/confluence/strategy-sync?libraryId=library-1&spaceId=space-1",
    ],
    ["PUT", "/api/aios/confluence/strategy-sync", "/api/confluence/strategy-sync"],
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

console.log("aiOS project skill proxy route contracts passed.");

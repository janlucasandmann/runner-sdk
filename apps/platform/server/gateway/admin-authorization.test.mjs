import assert from "node:assert/strict";
import test from "node:test";

import {
  createAdminAuthorization,
  extractPlatformIdToken,
  readPlatformCookie,
} from "./admin-authorization.mjs";

test("reads encoded session cookies and bearer tokens", () => {
  const request = {
    headers: {
      cookie: "other=1; __session=encoded%20token",
      authorization: "",
    },
  };
  assert.equal(readPlatformCookie(request, "__session"), "encoded token");
  assert.equal(extractPlatformIdToken(request), "encoded token");
  assert.equal(extractPlatformIdToken({
    headers: { authorization: "Bearer bearer-token" },
  }), "bearer-token");
});

test("builds restricted login redirects with the original query", () => {
  const authorization = createAdminAuthorization({
    aiosOrigin: "https://app.example.test",
    feedbackSummaryAdminEnvFileCandidates: [],
    fetchAiosApi: async () => new Response("{}", { status: 401 }),
    hasAiosSession: () => false,
    platformOrigin: "https://platform.example.test",
    port: 4177,
  });
  const login = new URL(authorization.buildFeedbackSummaryLoginUrl({
    url: "/feedback-summary?period=month",
    headers: {},
  }));
  assert.equal(login.origin, "https://app.example.test");
  assert.equal(login.pathname, "/login");
  assert.equal(
    login.searchParams.get("redirect"),
    "https://platform.example.test/feedback-summary?period=month",
  );
});

import assert from "node:assert/strict";
import test from "node:test";

import {
  mergeCustomSkillLists,
  normalizeNotionAuthUrl,
  renderBriefingPreviewHtml,
} from "./aios-domain.mjs";

test("rewrites only local Notion callback URLs", () => {
  const authUrl = "https://api.notion.com/oauth/authorize?redirect_uri=http%3A%2F%2Flocalhost%3A4177%2Fcallback";
  const rewritten = new URL(normalizeNotionAuthUrl(
    authUrl,
    "https://platform.example.test/notion/callback",
  ));
  assert.equal(
    rewritten.searchParams.get("redirect_uri"),
    "https://platform.example.test/notion/callback",
  );
});

test("normalizes and de-duplicates custom skills", () => {
  assert.deepEqual(mergeCustomSkillLists(
    [{ id: "skill", files: [{ name: " index.js ", content: "one" }] }],
    [{ id: "skill", codeFiles: [{ name: "main.js", content: "two" }] }],
  ), [{
    id: "skill",
    codeFiles: [{ name: "main.js", content: "two", language: undefined }],
    isCustom: true,
  }]);
});

test("injects a safe base URL into briefing previews", () => {
  const html = renderBriefingPreviewHtml(
    "<html><body>Briefing</body></html>",
    "https://cdn.example.test/briefing/index.html?x=1&y=2",
  );
  assert.match(html, /<head><base href="https:\/\/cdn\.example\.test\/briefing\/index\.html\?x=1&amp;y=2"/);
});

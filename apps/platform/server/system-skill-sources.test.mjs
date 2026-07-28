import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createSystemSkillSourceService } from "./system-skill-sources.mjs";

const root = await fs.mkdtemp(path.join(os.tmpdir(), "platform-skill-source-"));
await fs.mkdir(path.join(root, "browser", "scripts"), { recursive: true });
await fs.mkdir(path.join(root, "browser", "references"), { recursive: true });
await fs.writeFile(path.join(root, "browser", "SKILL.md"), "# Browser\n");
await fs.writeFile(path.join(root, "browser", "scripts", "inspect.ts"), "export const inspect = true;\n");
await fs.writeFile(path.join(root, "browser", "references", "contract.md"), "# Contract\n");
await fs.writeFile(path.join(root, "browser", "references", "schema.xsd"), "<schema />\n");
await fs.writeFile(path.join(root, "browser", "ignored.bin"), "ignored");

const responses = [];
const service = createSystemSkillSourceService({
  root,
  sendJson(_res, status, payload) {
    responses.push({ status, payload });
  },
});

const first = await service.loadSource("browser");
const second = await service.loadSource("browser");
assert.equal(first, second);
assert.equal(first.markdown, "# Browser\n");
assert.deepEqual(first.codeFiles.map((file) => file.name), [
  "SKILL.md",
  "scripts/inspect.ts",
  "references/contract.md",
  "references/schema.xsd",
]);
assert.equal(
  first.codeFiles.find((file) => file.name === "references/schema.xsd")?.language,
  "xml",
);

assert.equal(
  service.handleRequest(
    { method: "GET" },
    {},
    new URL("http://localhost/api/platform/system-skills/browser/source"),
  ),
  true,
);
await new Promise((resolve) => setImmediate(resolve));
assert.equal(responses[0].status, 200);
assert.equal(responses[0].payload.source, first);

assert.equal(
  service.handleRequest(
    { method: "POST" },
    {},
    new URL("http://localhost/api/platform/system-skills/browser/source"),
  ),
  false,
);

await fs.rm(root, { recursive: true, force: true });
console.log("Lazy system skill source contracts passed.");

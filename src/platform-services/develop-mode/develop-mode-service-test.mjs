import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const modeRoot = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(modeRoot, "../../..");
const serviceNames = [
  "api-keys",
  "web-apps",
  "apis",
  "functions",
  "databases",
  "authentication",
  "agent-runtime",
  "voice-agents",
  "secrets",
  "payments",
];

for (const serviceName of serviceNames) {
  for (const relativePath of [
    "README.md",
    "index.ts",
    "client/index.ts",
    "client/domain/index.ts",
    "client/page/index.ts",
  ]) {
    await fs.access(path.join(modeRoot, serviceName, relativePath));
  }
}

await assert.rejects(
  fs.access(path.join(modeRoot, "resources")),
  /ENOENT/,
  "The legacy generic resources ownership bucket must stay removed.",
);

const demoServerSource = await fs.readFile(path.join(packageRoot, "examples/demo-server.mjs"), "utf8");
assert.match(demoServerSource, /DevelopResourceOverviewRoute/);
assert.match(demoServerSource, /DevelopVoiceAgentsOverviewPage/);
assert.match(demoServerSource, /DevelopApiKeysOverviewPage/);
assert.doesNotMatch(demoServerSource, /DevelopResourceOverviewPage/);

console.log(`Develop mode service boundaries passed (${serviceNames.length} services checked).`);

import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const searchRoots = ["apps", "src"];
const excludedTests = new Set(["apps/platform/testing/platform-architecture.test.mjs"]);

function isNodeContractTest(relativePath) {
  return (
    (relativePath.endsWith(".test.mjs") || relativePath.endsWith("-service-test.mjs")) &&
    !excludedTests.has(relativePath)
  );
}

async function collectTests(relativeDirectory) {
  const absoluteDirectory = path.join(repositoryRoot, relativeDirectory);
  const entries = await fs.readdir(absoluteDirectory, { withFileTypes: true });
  const tests = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      tests.push(...(await collectTests(relativePath)));
    } else if (entry.isFile() && isNodeContractTest(relativePath)) {
      tests.push(relativePath);
    }
  }

  return tests;
}

function runTest(relativePath) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [relativePath], {
      cwd: repositoryRoot,
      env: {
        ...process.env,
        NODE_ENV: "test",
      },
      stdio: "inherit",
    });

    child.once("error", (error) => resolve({ relativePath, error }));
    child.once("exit", (code, signal) => {
      resolve({
        relativePath,
        code: code ?? 1,
        signal,
      });
    });
  });
}

const tests = (await Promise.all(searchRoots.map((root) => collectTests(root)))).flat().sort();

if (process.argv.includes("--list")) {
  process.stdout.write(`${tests.join("\n")}\n`);
  process.exit(0);
}

console.log(`Running ${tests.length} Node contract tests sequentially.`);
const failures = [];

for (const [index, test] of tests.entries()) {
  console.log(`\n[${index + 1}/${tests.length}] ${test}`);
  const result = await runTest(test);
  if (result.error || result.code !== 0) failures.push(result);
}

if (failures.length > 0) {
  console.error(`\n${failures.length} Node contract test(s) failed:`);
  for (const failure of failures) {
    const reason =
      failure.error?.message ??
      `exit ${failure.code}${failure.signal ? ` (${failure.signal})` : ""}`;
    console.error(`- ${failure.relativePath}: ${reason}`);
  }
  process.exitCode = 1;
} else {
  console.log(`\nAll ${tests.length} Node contract tests passed.`);
}

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const deploymentDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(deploymentDirectory, "../..");
const deploySource = fs.readFileSync(
  path.join(deploymentDirectory, "deploy.sh"),
  "utf8",
);

assert.ok(
  fs.existsSync(path.join(repositoryRoot, "img", "spinner.svg")),
  "The canonical loading spinner asset must exist.",
);
assert.match(
  deploySource,
  /for public_file in camark\.svg spinner\.svg;/,
  "Production staging must copy the loading spinner into the public image directory.",
);

console.log("Platform deployment asset contract passed.");

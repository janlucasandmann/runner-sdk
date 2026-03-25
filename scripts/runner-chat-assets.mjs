import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, "..");
const cssPath = path.join(packageRoot, "src", "react", "runner-chat.css");
const generatedTsPath = path.join(packageRoot, "src", "react", "runner-chat-css.ts");
const distCssPath = path.join(packageRoot, "dist", "react", "runner-chat.css");
const assetsSourceDir = path.join(packageRoot, "src", "react", "assets");
const distAssetsDir = path.join(packageRoot, "dist", "react", "assets");
const bundledDiffCssPath = path.join(packageRoot, "node_modules", "@git-diff-view", "react", "styles", "diff-view-pure.css");

function serializeCssAsTs(cssText) {
  const escaped = cssText.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  return `// This file is generated from runner-chat.css by scripts/runner-chat-assets.mjs.\n// Edit the CSS source instead of modifying this file directly.\n\nexport const runnerChatCss = String.raw\`${escaped}\`;\n`;
}

async function loadBundledCss() {
  const [baseCssText, diffCssText] = await Promise.all([
    fs.readFile(cssPath, "utf8"),
    fs.readFile(bundledDiffCssPath, "utf8"),
  ]);
  return `${diffCssText}\n\n${baseCssText}`;
}

async function prepare() {
  const cssText = await loadBundledCss();
  await fs.writeFile(generatedTsPath, serializeCssAsTs(cssText), "utf8");
}

async function copy() {
  const cssText = await loadBundledCss();
  await fs.mkdir(path.dirname(distCssPath), { recursive: true });
  await fs.writeFile(distCssPath, cssText, "utf8");
  await fs.mkdir(distAssetsDir, { recursive: true });
  const assets = await fs.readdir(assetsSourceDir);
  await Promise.all(
    assets.map(async (assetName) => {
      await fs.copyFile(path.join(assetsSourceDir, assetName), path.join(distAssetsDir, assetName));
    })
  );
}

const mode = process.argv[2];

if (mode === "prepare") {
  await prepare();
} else if (mode === "copy") {
  await copy();
} else {
  throw new Error(`Unknown mode: ${mode || "<empty>"}. Use "prepare" or "copy".`);
}

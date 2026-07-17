import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const ignoredDirectories = new Set([".git", ".platform-dev", "dist", "node_modules"]);

async function collectMarkdownFiles(directory) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectMarkdownFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(entryPath);
    }
  }
  return files;
}

function normalizeLinkTarget(rawTarget) {
  const trimmed = rawTarget.trim();
  const target = trimmed.startsWith("<")
    ? trimmed.slice(1, trimmed.indexOf(">"))
    : trimmed.split(/\s+["']/)[0];
  return target.split("#")[0].split("?")[0];
}

function isExternalTarget(target) {
  return (
    !target ||
    target.startsWith("#") ||
    target.startsWith("/") ||
    /^[a-z][a-z0-9+.-]*:/i.test(target)
  );
}

const markdownFiles = await collectMarkdownFiles(repositoryRoot);
const missingLinks = [];
const markdownLinkPattern = /!?\[[^\]]*]\(([^)\n]+)\)/g;

for (const markdownFile of markdownFiles) {
  const source = await fs.readFile(markdownFile, "utf8");
  for (const match of source.matchAll(markdownLinkPattern)) {
    const target = normalizeLinkTarget(match[1]);
    if (isExternalTarget(target)) continue;

    const decodedTarget = decodeURIComponent(target);
    const absoluteTarget = path.resolve(path.dirname(markdownFile), decodedTarget);
    try {
      await fs.access(absoluteTarget);
    } catch {
      missingLinks.push(`${path.relative(repositoryRoot, markdownFile)} -> ${target}`);
    }
  }
}

assert.deepEqual(
  missingLinks,
  [],
  `Documentation contains broken local links:\n${missingLinks.join("\n")}`,
);

console.log(`Documentation links verified across ${markdownFiles.length} Markdown files.`);

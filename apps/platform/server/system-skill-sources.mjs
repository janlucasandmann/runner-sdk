import fs from "node:fs/promises";
import path from "node:path";

const SYSTEM_SKILL_SOURCE_DIRECTORIES = Object.freeze({
  app_platform: "app-platform",
  browser: "browser",
  computer_agents: "computer-agents",
  deep_research: "deep-research",
  email: "email",
  frontend_design: "frontend-design",
  image_generation: "image-generation",
  image_understanding: "image-understanding",
  memory: "memory",
  pdf: "pdf",
  pptx: "pptx",
  task_management: "task-management",
  video_generation: "video-generation",
  web_search: "web-search",
});

const TEXT_FILE_EXTENSIONS = new Set([
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".py",
  ".ts",
  ".tsx",
  ".txt",
]);

function getSourceLanguage(relativePath) {
  const extension = path.extname(relativePath).toLowerCase();
  if (extension === ".js" || extension === ".mjs") return "javascript";
  if (extension === ".json") return "json";
  if (extension === ".md") return "markdown";
  if (extension === ".py") return "python";
  if (extension === ".ts" || extension === ".tsx") return "typescript";
  return "plaintext";
}

function shouldIncludeSourceFile(relativePath, skillId) {
  const normalizedPath = relativePath.split(path.sep).join("/");
  const extension = path.extname(normalizedPath).toLowerCase();
  if (!TEXT_FILE_EXTENSIONS.has(extension)) return false;
  if (normalizedPath.includes("__pycache__/") || normalizedPath.endsWith(".pyc")) return false;
  if (normalizedPath === "LICENSE.txt") return false;
  if (normalizedPath === "SKILL.md") return true;
  if (normalizedPath.startsWith("scripts/")) return true;
  if (skillId === "frontend_design" && normalizedPath.startsWith("references/") && extension === ".md") {
    return true;
  }
  return (skillId === "pdf" || skillId === "pptx") && extension === ".md";
}

async function listSourceFiles(root, skillId, relativeBase = "") {
  let entries = [];
  try {
    entries = await fs.readdir(path.join(root, relativeBase), { withFileTypes: true });
  } catch {
    return [];
  }

  const files = [];
  for (const entry of entries) {
    const relativePath = relativeBase ? path.join(relativeBase, entry.name) : entry.name;
    if (entry.isDirectory()) {
      if (entry.name !== "__pycache__") {
        files.push(...await listSourceFiles(root, skillId, relativePath));
      }
    } else if (entry.isFile() && shouldIncludeSourceFile(relativePath, skillId)) {
      files.push(relativePath);
    }
  }
  return files;
}

export function createSystemSkillSourceService({ root, sendJson }) {
  if (typeof sendJson !== "function") {
    throw new TypeError("System skill source service requires a sendJson adapter.");
  }
  const normalizedRoot = path.resolve(String(root || ""));
  const sourcePromiseBySkillId = new Map();

  async function loadSource(skillId) {
    const normalizedSkillId = String(skillId || "").trim().toLowerCase();
    const directoryName = SYSTEM_SKILL_SOURCE_DIRECTORIES[normalizedSkillId];
    if (!directoryName) {
      return null;
    }
    if (!sourcePromiseBySkillId.has(normalizedSkillId)) {
      sourcePromiseBySkillId.set(normalizedSkillId, (async () => {
        const skillRoot = path.join(normalizedRoot, directoryName);
        const relativeFiles = (await listSourceFiles(skillRoot, normalizedSkillId)).sort((left, right) => {
          if (left === "SKILL.md") return -1;
          if (right === "SKILL.md") return 1;
          if (left.startsWith("scripts/") !== right.startsWith("scripts/")) {
            return left.startsWith("scripts/") ? -1 : 1;
          }
          return left.localeCompare(right);
        });
        const codeFiles = [];
        for (const relativeFile of relativeFiles) {
          try {
            const normalizedName = relativeFile.split(path.sep).join("/");
            codeFiles.push({
              id: `${normalizedSkillId}-${normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
              name: normalizedName,
              content: await fs.readFile(path.join(skillRoot, relativeFile), "utf8"),
              language: getSourceLanguage(normalizedName),
            });
          } catch {}
        }
        const skillMarkdownFile = codeFiles.find((file) => file.name === "SKILL.md");
        return Object.freeze({
          markdown: skillMarkdownFile?.content || "",
          codeFiles,
        });
      })());
    }
    return sourcePromiseBySkillId.get(normalizedSkillId);
  }

  return Object.freeze({
    loadSource,
    handleRequest(req, res, url) {
      const match = url.pathname.match(/^\/api\/platform\/system-skills\/([^/]+)\/source$/);
      if (String(req.method || "GET").toUpperCase() !== "GET" || !match) {
        return false;
      }
      void loadSource(decodeURIComponent(match[1]))
        .then((source) => {
          if (!source) {
            sendJson(res, 404, { error: "System skill source not found." });
            return;
          }
          sendJson(res, 200, { source });
        })
        .catch((error) => {
          sendJson(res, 500, {
            error: error instanceof Error ? error.message : "Failed to load system skill source.",
          });
        });
      return true;
    },
  });
}


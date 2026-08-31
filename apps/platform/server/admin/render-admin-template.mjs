import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const adminRoot = path.dirname(fileURLToPath(import.meta.url));
const templateRoot = path.join(adminRoot, "templates");
const templateCache = new Map();

function readAdminTemplate(templateName) {
  const normalizedName = path.basename(String(templateName || ""));
  if (!normalizedName.endsWith(".html")) {
    throw new Error(`Invalid admin template name: ${templateName}`);
  }
  if (!templateCache.has(normalizedName)) {
    templateCache.set(
      normalizedName,
      fs.readFileSync(path.join(templateRoot, normalizedName), "utf8"),
    );
  }
  return templateCache.get(normalizedName);
}

export function createAdminHtmlRenderer(
  templateName,
  replacements = {},
  { statusCode = 200 } = {},
) {
  const template = readAdminTemplate(templateName);
  const html = Object.entries(replacements).reduce(
    (source, [placeholder, value]) => (
      source.replaceAll(`__${placeholder}__`, String(value))
    ),
    template,
  );

  return function serveAdminHtmlPage(res) {
    res.writeHead(statusCode, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(html);
  };
}

export function serializeAdminScriptValue(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const packageRoot = path.resolve(path.dirname(__filename), "..");
const scanTargets = [
  { root: path.join(packageRoot, "src"), extensions: new Set([".tsx"]) },
  { root: path.join(packageRoot, "examples"), extensions: new Set([".mjs"]) },
];
const canonicalImplementations = new Set([
  path.join(packageRoot, "src", "platform-ui", "components", "composite", "popup", "platform-popup.tsx"),
  path.join(packageRoot, "src", "platform-ui", "components", "composite", "modal", "platform-modal.tsx"),
]);
const intrinsicSurfaceTags = new Set(["aside", "div", "form", "section", "span"]);
const semanticOverlayRoles = new Set(["alertdialog", "dialog", "listbox", "menu"]);

async function collectSourceFiles(root, extensions) {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectSourceFiles(entryPath, extensions));
    } else if (extensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }
  return files;
}

function getPropertyName(node, sourceFile) {
  if (!node) return "";
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) return node.text;
  return node.getText(sourceFile).replace(/^['"]|['"]$/g, "");
}

function collectLiteralText(node, values = [], bindings = new Map(), visitedBindings = new Set()) {
  if (!node) return values;
  if (ts.isIdentifier(node) && bindings.has(node.text) && !visitedBindings.has(node.text)) {
    visitedBindings.add(node.text);
    collectLiteralText(bindings.get(node.text), values, bindings, visitedBindings);
    visitedBindings.delete(node.text);
    return values;
  }
  if (ts.isStringLiteralLike(node)) {
    values.push(node.text);
    return values;
  }
  if (ts.isTemplateExpression(node)) {
    values.push(node.head.text);
    for (const span of node.templateSpans) {
      collectLiteralText(span.expression, values, bindings, visitedBindings);
      values.push(span.literal.text);
    }
    return values;
  }
  if (ts.isJsxExpression(node)) {
    return collectLiteralText(node.expression, values, bindings, visitedBindings);
  }
  ts.forEachChild(node, (child) => collectLiteralText(child, values, bindings, visitedBindings));
  return values;
}

function getObjectProperty(objectLiteral, propertyName, sourceFile) {
  if (!objectLiteral || !ts.isObjectLiteralExpression(objectLiteral)) return null;
  for (const property of objectLiteral.properties) {
    if (ts.isPropertyAssignment(property) && getPropertyName(property.name, sourceFile) === propertyName) {
      return property.initializer;
    }
  }
  return null;
}

function getJsxAttribute(node, attributeName) {
  for (const property of node.attributes.properties) {
    if (ts.isJsxAttribute(property) && property.name.getText() === attributeName) {
      return property.initializer;
    }
  }
  return null;
}

function isCreateElementCall(node) {
  if (!ts.isCallExpression(node)) return false;
  if (ts.isIdentifier(node.expression)) return node.expression.text === "createElement";
  return ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === "createElement";
}

function classifyOverlay(classText, roleText) {
  const classTokens = classText.split(/\s+/).filter(Boolean);
  const role = roleText.trim().toLowerCase();
  const popupShell = classTokens.some((token) => /-(?:popup|menu|popover)-(?:anchor|portal|scope|shell)$/.test(token));
  const popup = !popupShell && classTokens.some((token) => token === "tb-popup-menu" || /-(?:menu|popup|popover)$/.test(token));
  const popupDismissLayer = classTokens.some((token) => (
    /-(?:popup|menu)-(?:backdrop|scrim)$/.test(token)
    || /-(?:context|search)-backdrop$/.test(token)
  ));
  const modal = classTokens.some((token) => /-(?:modal|dialog)$/.test(token));
  const semantic = semanticOverlayRoles.has(role);
  if (modal) return "modal";
  if (popup || popupDismissLayer || semantic) return "popup";
  return "";
}

function lineNumberAt(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function lineNumberInText(source, index) {
  return source.slice(0, index).split("\n").length;
}

function extractLiteralProperty(snippet, propertyName) {
  const direct = snippet.match(new RegExp(propertyName + "\\s*:\\s*\\(?\\s*[\\\"'`]([^\\\"'`]*)[\\\"'`]"));
  if (direct) return direct[1];
  const array = snippet.match(new RegExp(propertyName + "\\s*:\\s*\\[([\\s\\S]{0,420}?)\\]"));
  if (!array) return "";
  return Array.from(array[1].matchAll(/["'`]([^"'`]*)["'`]/g), (match) => match[1]).join(" ");
}

function extractObjectLiteralSource(source, openingBraceIndex) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = openingBraceIndex; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = "";
      }
      continue;
    }
    if (character === "\"" || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(openingBraceIndex, index + 1);
    }
  }
  return "";
}

function findRawOverlaySurfacesInEmbeddedSource(source, filePath) {
  const findings = [];
  const createElementPattern = /(?:React\.)?createElement\("(aside|div|form|section|span)",\s*\{/g;
  for (const match of source.matchAll(createElementPattern)) {
    const openingBraceIndex = source.indexOf("{", match.index);
    const propsSource = extractObjectLiteralSource(source, openingBraceIndex);
    const classText = extractLiteralProperty(propsSource, "className");
    const roleText = extractLiteralProperty(propsSource, "role");
    const kind = classifyOverlay(classText, roleText);
    if (!kind) continue;
    findings.push({
      filePath,
      line: lineNumberInText(source, match.index),
      tagName: match[1],
      classText,
      roleText,
      kind,
    });
  }
  return findings;
}

function findRawOverlaySurfaces(source, filePath) {
  const scriptKind = path.extname(filePath) === ".tsx" ? ts.ScriptKind.TSX : ts.ScriptKind.JS;
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, scriptKind);
  const findings = [];
  const bindings = new Map();

  function collectBindings(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      bindings.set(node.name.text, node.initializer);
    }
    ts.forEachChild(node, collectBindings);
  }
  collectBindings(sourceFile);

  function record(node, tagName, classNode, roleNode) {
    if (!intrinsicSurfaceTags.has(tagName)) return;
    const classText = collectLiteralText(classNode, [], bindings).join(" ");
    const roleText = collectLiteralText(roleNode, [], bindings).join(" ");
    const kind = classifyOverlay(classText, roleText);
    if (!kind) return;
    findings.push({
      filePath,
      line: lineNumberAt(sourceFile, node),
      tagName,
      classText: classText.trim(),
      roleText: roleText.trim(),
      kind,
    });
  }

  function visit(node) {
    if (isCreateElementCall(node) && node.arguments.length >= 2 && ts.isStringLiteral(node.arguments[0])) {
      const props = node.arguments[1];
      record(
        node,
        node.arguments[0].text,
        getObjectProperty(props, "className", sourceFile),
        getObjectProperty(props, "role", sourceFile)
      );
    } else if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      record(
        node,
        node.tagName.getText(sourceFile),
        getJsxAttribute(node, "className"),
        getJsxAttribute(node, "role")
      );
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return findings;
}

const sourceFiles = (await Promise.all(
  scanTargets.map(({ root, extensions }) => collectSourceFiles(root, extensions))
)).flat();
const findings = [];
for (const filePath of sourceFiles) {
  if (canonicalImplementations.has(filePath)) continue;
  const source = await fs.readFile(filePath, "utf8");
  findings.push(...findRawOverlaySurfaces(source, filePath));
  if (path.extname(filePath) === ".mjs") {
    findings.push(...findRawOverlaySurfacesInEmbeddedSource(source, filePath));
  }
}

const uniqueFindings = Array.from(new Map(
  findings.map((finding) => [`${finding.filePath}:${finding.line}:${finding.kind}`, finding])
).values());

if (uniqueFindings.length > 0) {
  const details = uniqueFindings
    .map(({ filePath, line, tagName, classText, roleText, kind }) => (
      `- ${path.relative(packageRoot, filePath)}:${line} raw ${kind} <${tagName}>`
      + `${classText ? ` (${classText})` : ""}`
      + `${roleText ? ` role=${roleText}` : ""}`
    ))
    .join("\n");
  throw new Error(
    "Raw overlay surfaces are not allowed. Use PlatformPopupSurface or the PlatformModal primitives:\n"
    + details
  );
}

console.log(`Platform overlay invariant passed (${sourceFiles.length} source files scanned).`);

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
const canonicalImplementation = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "ui",
  "button",
  "platform-button.tsx"
);
const explicitReferenceClasses = new Set([
  "playground-project-overview-summary-mission-button",
  "playground-tasks-nav-issue-button",
]);

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

function hasLegacyVariant(classText) {
  const tokens = classText.split(/\s+/).filter(Boolean);
  return tokens.some((token) => (
    token === "is-primary"
    || token === "is-secondary"
    || /-(?:primary|secondary)$/.test(token)
    || /(?:^|-)(?:primary|secondary)-button(?:$|-)/.test(token)
    || /(?:^|-)button-(?:primary|secondary)(?:$|-)/.test(token)
    || explicitReferenceClasses.has(token)
  ));
}

function lineNumberAt(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function lineNumberInText(source, index) {
  return source.slice(0, index).split("\n").length;
}

function extractObjectLiteralSource(source, openingBraceIndex) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = openingBraceIndex; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
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

function extractEmbeddedClassText(propsSource) {
  const classIndex = propsSource.search(/\bclassName\s*:/);
  if (classIndex < 0) return "";
  const expression = propsSource.slice(classIndex).split(/\n\s*[A-Za-z_$][\w$]*\s*:/, 1)[0];
  return Array.from(expression.matchAll(/["'`]([^"'`]*)["'`]/g), (match) => match[1]).join(" ");
}

function findEmbeddedRawButtons(source, filePath) {
  const findings = [];
  const pattern = /(?:React\.)?createElement\("button",\s*\{/g;
  for (const match of source.matchAll(pattern)) {
    const openingBraceIndex = source.indexOf("{", match.index);
    const propsSource = extractObjectLiteralSource(source, openingBraceIndex);
    const classText = extractEmbeddedClassText(propsSource);
    if (!hasLegacyVariant(classText)) continue;
    findings.push({ filePath, line: lineNumberInText(source, match.index), classText });
  }
  return findings;
}

function findRawButtons(source, filePath) {
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

  function record(node, classNode) {
    const classText = collectLiteralText(classNode, [], bindings).join(" ").trim();
    if (hasLegacyVariant(classText)) {
      findings.push({ filePath, line: lineNumberAt(sourceFile, node), classText });
    }
  }

  function visit(node) {
    if (
      isCreateElementCall(node)
      && node.arguments.length >= 2
      && ts.isStringLiteral(node.arguments[0])
      && node.arguments[0].text === "button"
    ) {
      record(node, getObjectProperty(node.arguments[1], "className", sourceFile));
    } else if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))
      && node.tagName.getText(sourceFile) === "button"
    ) {
      record(node, getJsxAttribute(node, "className"));
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
  if (filePath === canonicalImplementation) continue;
  const source = await fs.readFile(filePath, "utf8");
  findings.push(...findRawButtons(source, filePath));
  if (path.extname(filePath) === ".mjs") findings.push(...findEmbeddedRawButtons(source, filePath));
}

const uniqueFindings = Array.from(new Map(
  findings.map((finding) => [`${finding.filePath}:${finding.line}`, finding])
).values());

if (uniqueFindings.length > 0) {
  const details = uniqueFindings
    .map(({ filePath, line, classText }) => `- ${path.relative(packageRoot, filePath)}:${line} (${classText})`)
    .join("\n");
  throw new Error(
    "Raw primary/secondary buttons are not allowed. Use PlatformButton or its variant components:\n"
    + details
  );
}

console.log(`Platform button invariant passed (${sourceFiles.length} source files scanned).`);

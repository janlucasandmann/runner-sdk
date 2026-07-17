import assert from "node:assert/strict";
import ts from "typescript";

import { createLegacyPlatformApplication } from "../client/legacy/create-legacy-platform-application.mjs";
import { extractPlatformDocumentSources } from "../server/platform-assets.mjs";

function getNodeName(node) {
  if (node.name && ts.isIdentifier(node.name)) {
    return node.name.text;
  }
  if (
    (ts.isArrowFunction(node) || ts.isFunctionExpression(node))
    && node.parent
    && ts.isVariableDeclaration(node.parent)
    && ts.isIdentifier(node.parent.name)
  ) {
    return node.parent.name.text;
  }
  if (
    node.parent
    && ts.isPropertyAssignment(node.parent)
    && ts.isIdentifier(node.parent.name)
  ) {
    return node.parent.name.text;
  }
  return "<anonymous>";
}

const documentHtml = createLegacyPlatformApplication({
  aiosOrigin: "http://localhost:3001",
  defaultUpstreamOrigin: "https://api.computer-agents.com/v1",
  platformOrigin: "http://localhost:4177",
});
const { cssSource, moduleSource } = extractPlatformDocumentSources(documentHtml);
const sourceFile = ts.createSourceFile(
  "platform-legacy-client.js",
  moduleSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.JS,
);
const moduleSourceLines = moduleSource.split("\n");
const parseDiagnostics = sourceFile.parseDiagnostics || [];
assert.equal(
  parseDiagnostics.length,
  0,
  parseDiagnostics
    .map((diagnostic) => {
      const position = sourceFile.getLineAndCharacterOfPosition(
        Math.max(0, diagnostic.start || 0),
      );
      const sourceContext = moduleSourceLines
        .slice(Math.max(0, position.line - 1), position.line + 2)
        .map((line, contextIndex) => {
          const lineNumber = Math.max(0, position.line - 1) + contextIndex + 1;
          return `${lineNumber} | ${line}`;
        })
        .join("\n");
      return [
        `${position.line + 1}:${position.character + 1} ${
          ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
        }`,
        sourceContext,
      ].join("\n");
    })
    .join("\n"),
);
const functions = [];

function inspect(node, depth = 0) {
  if (
    (ts.isFunctionDeclaration(node)
      || ts.isFunctionExpression(node)
      || ts.isArrowFunction(node)
      || ts.isMethodDeclaration(node))
    && node.body
  ) {
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    const end = sourceFile.getLineAndCharacterOfPosition(node.end);
    functions.push({
      name: getNodeName(node),
      depth,
      startLine: start.line + 1,
      endLine: end.line + 1,
      lines: end.line - start.line + 1,
    });
  }
  ts.forEachChild(node, (child) => inspect(child, depth + 1));
}

inspect(sourceFile);

const imports = sourceFile.statements.filter(ts.isImportDeclaration);
const largestFunctions = functions
  .sort((left, right) => right.lines - left.lines)
  .slice(0, 40);

const auditReport = {
  moduleBytes: Buffer.byteLength(moduleSource),
  moduleLines: moduleSource.split("\n").length,
  cssBytes: Buffer.byteLength(cssSource),
  cssLines: cssSource.split("\n").length,
  importCount: imports.length,
  functionCount: functions.length,
  largestFunctions,
};

if (process.argv.includes("--syntax-only")) {
  console.log(
    `Legacy client syntax passed (${auditReport.moduleLines} module lines).`,
  );
} else {
  console.log(JSON.stringify(auditReport, null, 2));
}

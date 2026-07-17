import path from "node:path";

import {
  resolveRunnerChatStyleSourcePaths,
} from "../../../scripts/runner-chat-style-sources.mjs";

export const RUNNER_CHAT_CSS_HMR_MODULE_ID = "virtual:platform-runner-chat-css";
const RESOLVED_RUNNER_CHAT_CSS_HMR_MODULE_ID = `\0${RUNNER_CHAT_CSS_HMR_MODULE_ID}`;
const RUNNER_CHAT_STYLE_ELEMENT_ID = "runner-web-sdk-chat-styles-v3";

function toViteFsUrl(filePath) {
  const normalizedPath = path.resolve(filePath).split(path.sep).join("/");
  return `/@fs${normalizedPath.startsWith("/") ? "" : "/"}${normalizedPath}`;
}

function isRunnerChatGeneratedCssImport(id, importer) {
  if (!importer) return false;
  const normalizedId = String(id || "").split("?")[0].replaceAll("\\", "/");
  const normalizedImporter = String(importer).split("?")[0].replaceAll("\\", "/");
  return normalizedImporter.endsWith("/src/react/runner-chat-styles.ts")
    && (
      normalizedId === "./runner-chat-css.js"
      || normalizedId.endsWith("/src/react/runner-chat-css.js")
      || normalizedId.endsWith("/src/react/runner-chat-css.ts")
    );
}

function createRunnerChatCssModuleSource(sourcePaths) {
  const cssModuleUrls = sourcePaths.map((sourcePath) => `${toViteFsUrl(sourcePath)}?inline`);
  const imports = cssModuleUrls
    .map((url, index) => `import runnerChatCssPart${index} from ${JSON.stringify(url)};`)
    .join("\n");
  const initialParts = cssModuleUrls.map((_, index) => `runnerChatCssPart${index}`).join(", ");

  return `${imports}

function composeRunnerChatCss(parts) {
  return parts
    .map((part) => typeof part === "string" ? part : "")
    .join("\\n\\n");
}

export let runnerChatCss = composeRunnerChatCss([${initialParts}]);

if (import.meta.hot) {
  import.meta.hot.accept(${JSON.stringify(cssModuleUrls)}, (updatedModules) => {
    const modules = Array.isArray(updatedModules) ? updatedModules : [updatedModules];
    const nextParts = [${initialParts}].map((currentPart, index) => (
      typeof modules[index]?.default === "string" ? modules[index].default : currentPart
    ));
    runnerChatCss = composeRunnerChatCss(nextParts);
    const style = document.getElementById(${JSON.stringify(RUNNER_CHAT_STYLE_ELEMENT_ID)});
    if (style) {
      style.textContent = runnerChatCss;
    }
  });
}
`;
}

/**
 * Replaces the generated RunnerChat CSS string with source CSS modules during
 * development. Vite can then update the mounted style element in-place, so CSS
 * changes require neither the asset-generation command nor a page reload.
 */
export function createRunnerChatCssHmrPlugin({ packageRoot }) {
  const sourcePaths = resolveRunnerChatStyleSourcePaths(packageRoot);
  return {
    name: "platform-runner-chat-css-hmr",
    apply: "serve",
    enforce: "pre",
    resolveId(id, importer) {
      return isRunnerChatGeneratedCssImport(id, importer)
        ? RESOLVED_RUNNER_CHAT_CSS_HMR_MODULE_ID
        : null;
    },
    load(id) {
      return id === RESOLVED_RUNNER_CHAT_CSS_HMR_MODULE_ID
        ? createRunnerChatCssModuleSource(sourcePaths)
        : null;
    },
  };
}

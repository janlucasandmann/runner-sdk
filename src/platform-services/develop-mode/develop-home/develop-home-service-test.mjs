import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  DEVELOP_HOME_APP_SCRIPT_FRAGMENTS,
  DEVELOP_HOME_PAGE_CSS,
  DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS,
  DEVELOP_HOME_STYLE_FRAGMENTS,
  createDevelopHomePageScript,
} from "./index.mjs";

assert.deepEqual(Object.keys(DEVELOP_HOME_STYLE_FRAGMENTS), ["foundation", "content"]);
assert.match(DEVELOP_HOME_STYLE_FRAGMENTS.foundation, /^\s*\.playground-develop-home \{/);
assert.match(DEVELOP_HOME_STYLE_FRAGMENTS.content, /\.playground-develop-docs-concepts-grid/);
assert.equal(Object.values(DEVELOP_HOME_STYLE_FRAGMENTS).join(""), DEVELOP_HOME_PAGE_CSS);

assert.deepEqual(Object.keys(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS), [
  "operationalMetrics",
  "homeMetricsLifecycle",
  "resourceMetricsLifecycle",
]);
assert.match(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.operationalMetrics, /loadDevelopServerOperationalMetrics/);
assert.match(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.operationalMetrics, /publishOperationalMetricsSnapshot/);
assert.match(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.homeMetricsLifecycle, /developHomeSection !== "overview"/);
assert.match(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.resourceMetricsLifecycle, /requestedMetricsKey/);
assert.doesNotThrow(() => new Function(`
  function developHomeRuntimeHost() {
    ${Object.values(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS).join("\n")}
  }
`));

assert.deepEqual(Object.keys(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS), [
  "state",
  "metricsState",
  "navigation",
  "historyCapture",
  "historyRestore",
  "selectedTitle",
  "topNavigation",
  "sidebarEntry",
]);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.state, /developHomeSection/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.metricsState, /developServerOperationalMetrics/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.navigation, /function openDevelopHome/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.historyCapture, /developSection: developHomeSection/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.page === "develop"/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "develop-home"/);
assert.doesNotThrow(() => new Function(`
  function developHomeShellHost() {
    ${DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.state}
    ${DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.metricsState}
    ${DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.navigation}
    const capture = () => { ${DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.historyCapture} };
    const restore = (entry) => { ${DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.historyRestore} };
    const title = () => { ${DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.selectedTitle} return ""; };
    ${DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.topNavigation}
    const entries = [${DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.sidebarEntry}];
    return { capture, restore, title, entries };
  }
`));

const aiosOrigin = "https://platform.example.test";
const inferenceEntry = "            { label: \"Inference\", Icon: Cpu, onClick: openInferencePage },\n";
const pageScript = createDevelopHomePageScript({ aiosOrigin, inferenceEntry });
assert.match(pageScript, /function renderDevelopHomePage/);
assert.match(pageScript, /renderDevelopOperationalMetricsChart/);
assert.match(pageScript, /Inference/);
assert.match(pageScript, new RegExp(JSON.stringify(aiosOrigin + "/developers").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.doesNotMatch(pageScript, /__DEVELOP_HOME_/);
assert.doesNotThrow(() => new Function(pageScript));

const demoServerSource = await fs.readFile(
  new URL("../../../../examples/demo-server.mjs", import.meta.url),
  "utf8",
);
assert.match(demoServerSource, /develop-mode\/develop-home\/index\.mjs/);
assert.match(demoServerSource, /const DEVELOP_HOME_PAGE_SCRIPT = createDevelopHomePageScript/);
assert.match(demoServerSource, /\$\{DEVELOP_HOME_STYLE_FRAGMENTS\.content\}/);
assert.match(demoServerSource, /\$\{DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS\.operationalMetrics\}/);
assert.match(demoServerSource, /\$\{DEVELOP_HOME_APP_SCRIPT_FRAGMENTS\.navigation\}/);
assert.match(demoServerSource, /\$\{DEVELOP_HOME_PAGE_SCRIPT\}/);
assert.doesNotMatch(demoServerSource, /^\s*\.playground-develop-home \{/m);
assert.doesNotMatch(demoServerSource, /const loadDevelopServerOperationalMetrics = useCallback/);
assert.doesNotMatch(demoServerSource, /function openDevelopHome\(/);
assert.doesNotMatch(demoServerSource, /function renderDevelopHomePage\(/);

console.log("Develop Home ownership, browser syntax, navigation, metrics, and renderer contracts passed.");

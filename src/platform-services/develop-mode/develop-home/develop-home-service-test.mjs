import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  DEVELOP_HOME_APP_SCRIPT_FRAGMENTS,
  DEVELOP_HOME_PAGE_CSS,
  DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS,
  DEVELOP_HOME_STYLE_FRAGMENTS,
  createDevelopHomePageScript,
} from "./index.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

assert.deepEqual(Object.keys(DEVELOP_HOME_STYLE_FRAGMENTS), ["foundation", "content"]);
assert.match(DEVELOP_HOME_STYLE_FRAGMENTS.foundation, /^\s*\.playground-develop-home \{/);
assert.match(DEVELOP_HOME_STYLE_FRAGMENTS.foundation, /\.playground-develop-webhooks-overview-controls-slot/);
assert.match(DEVELOP_HOME_STYLE_FRAGMENTS.content, /\.playground-develop-docs-quickstart-card/);
assert.match(DEVELOP_HOME_STYLE_FRAGMENTS.content, /\.playground-develop-docs-concepts-grid/);
assert.match(DEVELOP_HOME_STYLE_FRAGMENTS.content, /\.develop-home-overview__header-menu-surface/);
assert.equal(Object.values(DEVELOP_HOME_STYLE_FRAGMENTS).join(""), DEVELOP_HOME_PAGE_CSS);
assert.equal(
  await fs.readFile(
    new URL("./client/styles/develop-home.css", import.meta.url),
    "utf8",
  ),
  DEVELOP_HOME_PAGE_CSS,
  "The typed Develop Home stylesheet must remain byte-identical to the compatibility style export.",
);

assert.deepEqual(Object.keys(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS), [
  "operationalMetrics",
  "homeMetricsLifecycle",
  "resourceMetricsLifecycle",
]);
assert.match(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.operationalMetrics, /loadDevelopServerOperationalMetrics/);
assert.match(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.operationalMetrics, /publishOperationalMetricsSnapshot/);
assert.match(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.operationalMetrics, /voiceCalls: buildSeries\("voiceCalls"\)/);
assert.match(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.operationalMetrics, /payload\?\.data\?\.analytics\?\.resources/);
assert.match(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.operationalMetrics, /"kind=" \+ encodeURIComponent\(targetKind\)/);
assert.match(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.operationalMetrics, /resources: activeScopedResources/);
assert.match(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.operationalMetrics, /readResourceChartBuckets\(resource, "traffic", "traffic24h"\)/);
assert.match(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.operationalMetrics, /readResourceChartBuckets\(resource, "operations", "operations24h"\)/);
assert.match(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.operationalMetrics, /entry\?\.bucket_start/);
assert.match(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.homeMetricsLifecycle, /activePage !== "develop"/);
assert.match(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.homeMetricsLifecycle, /period: developHomeChartTimescale/);
assert.match(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.homeMetricsLifecycle, /loadSettingsUsageData/);
assert.doesNotMatch(DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS.homeMetricsLifecycle, /developHomeSection/);
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
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.state, /developServerMetricsChartTab/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.state, /developAnalyticsMenuOpen/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.state, /developHomeChartTimescale/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.state, /developHomeChartTimescale, setDevelopHomeChartTimescale\] = useState\("month"\)/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.state, /developQuickstartLanguage/);
assert.doesNotMatch(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.state, /developHomeSection/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.metricsState, /developServerOperationalMetrics/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.navigation, /function openDevelopHome/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.navigation, /function openDevelopWebhooksPage/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.historyCapture, /page: "develop-webhooks"/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.historyCapture, /resourceId: settingsSelectedTriggerId/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.page === "develop"/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.historyRestore, /entry\.page === "develop-webhooks"/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.selectedTitle, /return "Home"/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.topNavigation, /pathItems: \[\{ label: "Develop" \}, \{ label: "Home" \}\]/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.topNavigation, /includeSearchDivider: true/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "develop-home"/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "develop-webhooks"/);
assert.match(DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.sidebarEntry, /Icon: Webhook/);
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
const pageScript = createDevelopHomePageScript({
  aiosOrigin,
  inferenceEntry: "            { id: \"inference\", label: \"Configure Inference\", Icon: Cpu, onClick: openInferencePage },\n",
});
assert.match(pageScript, /function renderDevelopHomePage/);
assert.match(pageScript, /React\.createElement\(DevelopHomeOverviewPage/);
assert.match(pageScript, /supplementaryContent/);
assert.match(pageScript, /quickstartLanguages/);
assert.match(pageScript, /coreConcepts/);
assert.match(pageScript, /quickLinks/);
assert.match(pageScript, /Configure Inference/);
assert.match(pageScript, /function renderDevelopWebhooksPage/);
assert.match(pageScript, /React\.createElement\(DevelopWebhooksOverviewPage/);
assert.match(pageScript, /renderWebhookActionsPanel\(\{ composerOnly: true \}\)/);
assert.match(pageScript, new RegExp(JSON.stringify(aiosOrigin + "/pricing").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.match(pageScript, new RegExp(JSON.stringify(aiosOrigin + "/developers/quickstart").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.match(pageScript, new RegExp(JSON.stringify(aiosOrigin + "/developers/core-concepts").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
assert.doesNotMatch(pageScript, /PlatformCodePreviewBox/);
assert.doesNotMatch(pageScript, /playground-develop-tab/);
assert.doesNotMatch(pageScript, /developHomeSection/);
assert.doesNotMatch(pageScript, /__DEVELOP_HOME_/);
assert.doesNotThrow(() => new Function(pageScript));

const platformEntrySource = await readPlatformCompositionSource();
assert.match(platformEntrySource, /develop-mode\/develop-home\/index\.mjs/);
assert.match(platformEntrySource, /DevelopHomeOverviewPage, DevelopResourceOverviewRoute/);
assert.match(platformEntrySource, /DevelopWebhooksOverviewPage/);
assert.match(platformEntrySource, /const DEVELOP_HOME_PAGE_SCRIPT = createDevelopHomePageScript/);
assert.match(platformEntrySource, /inferenceEntry: INFERENCE_APP_SCRIPT_FRAGMENTS\.configureHomeEntry/);
assert.match(platformEntrySource, /\$\{DEVELOP_HOME_STYLE_FRAGMENTS\.content\}/);
assert.match(platformEntrySource, /\$\{DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS\.operationalMetrics\}/);
assert.match(platformEntrySource, /\$\{DEVELOP_HOME_APP_SCRIPT_FRAGMENTS\.navigation\}/);
assert.match(platformEntrySource, /\$\{DEVELOP_HOME_PAGE_SCRIPT\}/);
assert.doesNotMatch(platformEntrySource, /^\s*\.playground-develop-home \{/m);
assert.doesNotMatch(platformEntrySource, /const loadDevelopServerOperationalMetrics = useCallback/);
assert.doesNotMatch(platformEntrySource, /function openDevelopHome\(/);
assert.doesNotMatch(platformEntrySource, /function renderDevelopHomePage\(/);
assert.doesNotMatch(platformEntrySource, /import \{ DevelopHomeOverviewPage \} from "\/dist\/platform-services\/develop-mode\/develop-home/);

const developHomeOverviewSource = await fs.readFile(
  new URL("./client/page/develop-home-overview-page.tsx", import.meta.url),
  "utf8",
);
assert.match(developHomeOverviewSource, /Developer quickstart/);
assert.match(developHomeOverviewSource, /Core concepts/);
assert.match(developHomeOverviewSource, /Quick Links/);
assert.match(developHomeOverviewSource, /DevelopHomeSupplementarySections/);

console.log("Develop Home and Webhooks overview ownership, browser syntax, navigation, metrics, and renderer contracts passed.");

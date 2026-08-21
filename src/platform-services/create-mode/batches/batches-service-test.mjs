import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  BATCHES_APP_SCRIPT_FRAGMENTS,
  BATCHES_PAGE_CSS,
  createBatchesService,
} from "./index.mjs";

const baseUrl = new URL("./", import.meta.url);
const overviewSource = await readFile(
  new URL("./client/page/batches-overview-page.tsx", baseUrl),
  "utf8",
);
const workspaceSource = await readFile(
  new URL("./client/page/batches-workspace-page.tsx", baseUrl),
  "utf8",
);
const createModalSource = await readFile(
  new URL("./client/page/batch-create-modal.tsx", baseUrl),
  "utf8",
);
const targetResourcesSource = await readFile(
  new URL("./client/batch-target-resources.ts", baseUrl),
  "utf8",
);
const manualRunInputsSource = await readFile(
  new URL("../metronome/client/components/metronome-manual-run-inputs.tsx", baseUrl),
  "utf8",
);
const manualRunContractsSource = await readFile(
  new URL("../metronome/client/manual-run-contracts.ts", baseUrl),
  "utf8",
);
const manualRunContextSource = await readFile(
  new URL("../metronome/client/manual-run-context.ts", baseUrl),
  "utf8",
);
const navigationSource = await readFile(
  new URL("../../../platform-shell/app-sidebar/client/components/navigation.mjs", baseUrl),
  "utf8",
);
const platformTemplate = await readFile(
  new URL("../../../../apps/platform/client/legacy/templates/platform.template.js", baseUrl),
  "utf8",
);
const compositionSource = await readFile(
  new URL(
    "../../../../apps/platform/client/legacy/domains/shell/controller/composition-and-modals.template.js",
    baseUrl,
  ),
  "utf8",
);
const bootstrapSource = await readFile(
  new URL(
    "../../../../apps/platform/client/legacy/domains/shell/controller/bootstrap-account-and-connectors.template.js",
    baseUrl,
  ),
  "utf8",
);
const lifecycleSource = await readFile(
  new URL(
    "../../../../apps/platform/client/legacy/domains/shell/controller/data-lifecycle-and-navigation.template.js",
    baseUrl,
  ),
  "utf8",
);

assert.match(overviewSource, /<SkillsOverviewPage/);
assert.match(overviewSource, /resourceName="Batches"/);
assert.match(overviewSource, /searchPlaceholder="Search batches"/);
assert.match(overviewSource, /rowActions=\{rowActions\}/);
assert.match(overviewSource, /<PlatformButtonSelector/);
assert.match(overviewSource, /mode="split-action"/);
assert.match(overviewSource, /buttonVariant="primary"/);
assert.match(overviewSource, /label="New Job"/);
assert.match(overviewSource, /popupVariant="minimal"/);
assert.match(overviewSource, /targetKind: "thread_run"/);
assert.match(overviewSource, /targetKind: "metronome_run"/);
assert.match(overviewSource, /targetKind: "evaluation_run"/);
assert.match(overviewSource, /targetKind: "agent_optimization"/);
assert.match(overviewSource, /targetKind: "project_ticket_action"/);
assert.match(
  workspaceSource,
  /onCreate=\{\(targetKind\) => openComposer\(targetKind \? \{ targetKind \} : undefined\)\}/,
);
assert.match(overviewSource, /<PlatformSwitch/);
assert.match(overviewSource, /label: "All Jobs"/);
assert.match(overviewSource, /label: "Created by me"/);
assert.match(overviewSource, /id: "stay_on_shelf"/);
assert.match(overviewSource, /label: "Stay on shelf"/);
assert.match(overviewSource, /job\.status !== "succeeded"/);
assert.match(overviewSource, /const owner = getBatchOwnerIdentity/);
assert.match(overviewSource, /ownerAvatarUrl: owner\.avatarUrl/);
assert.match(overviewSource, /header: "Owner"/);
assert.match(overviewSource, /selection=\{\{/);
assert.match(overviewSource, /activation: "row"/);
assert.match(overviewSource, /description: job\.description\?\.trim\(\) \|\| "No description"/);
assert.match(overviewSource, /updatedLabel: relativeTime\(job\.updatedAt\)/);
assert.doesNotMatch(overviewSource, /STATUS_LABELS/);
assert.match(overviewSource, /const JOB_TYPE_ICONS/);
assert.match(overviewSource, /const JobIcon = JOB_TYPE_ICONS\[job\.targetKind\]/);
assert.match(overviewSource, /icon: <JobIcon/);
assert.doesNotMatch(overviewSource, /Shelf work for later/);
assert.match(workspaceSource, /computer-agents:open-batch-composer/);
assert.match(workspaceSource, /computer-agents:open-batch/);
assert.match(workspaceSource, /setInterval\([\s\S]*5_000/);
assert.doesNotMatch(workspaceSource, /BatchDetailPage/);
assert.doesNotMatch(workspaceSource, /PlatformServiceDetailFrame/);
assert.match(workspaceSource, /setCreateOpen\(true\)/);
assert.match(workspaceSource, /activeJob \? \(activeJob\.status === "held" \? "edit" : "view"\) : "create"/);
assert.equal(BATCHES_APP_SCRIPT_FRAGMENTS.state, "");
assert.match(BATCHES_APP_SCRIPT_FRAGMENTS.topNavigation, /function renderBatchesPageNav/);
assert.doesNotMatch(BATCHES_APP_SCRIPT_FRAGMENTS.topNavigation, /batchesTopNavState/);
assert.match(compositionSource, /renderBatchesPageNav\(\)/);
assert.doesNotMatch(compositionSource, /onTopNavigationChange: setBatchesTopNavState/);
assert.match(BATCHES_PAGE_CSS, /\.batches-form-grid/);
assert.match(BATCHES_PAGE_CSS, /\.batches-page-error/);
assert.match(
  BATCHES_PAGE_CSS,
  /\.resource-overview-table\.is-batches\.is-catalog-ui[\s\S]*?\.platform-data-table__row-group\.is-grouped-row[\s\S]*?> \.platform-data-table__row\s*\{[\s\S]*?padding-left:\s*var\(--platform-data-table-catalog-inline-padding\);/,
);
assert.doesNotMatch(
  BATCHES_PAGE_CSS,
  /\.platform-data-table__cell\[data-column-id="name"\][\s\S]*?padding-left/,
);
assert.match(
  BATCHES_PAGE_CSS,
  /\.batches-create-modal[\s\S]*\.batches-create-modal__thread-composer\.tb-runner-chat[\s\S]*\.tb-input-shell\s*\{[\s\S]*position:\s*static;/,
);
assert.doesNotMatch(
  workspaceSource + overviewSource + createModalSource,
  /tests-form-/,
);
assert.match(navigationSource, /label: "(?:Metronome|Workflows)"[\s\S]*label: "Batches"/);
assert.match(navigationSource, /label: "Batches"[\s\S]*Icon: Truck/);
assert.match(platformTemplate, /BatchesWorkspacePage/);
assert.match(compositionSource, /React\.createElement\(BatchesWorkspacePage/);
assert.match(compositionSource, /id: "playground-batches-overview-scope"/);
assert.match(compositionSource, /scopePortalId: "playground-batches-overview-scope"/);
assert.match(compositionSource, /currentUser: \{/);
assert.match(compositionSource, /label: "Add to Batches"/);
assert.match(createModalSource, /sourceProjectId/);
assert.match(createModalSource, /sourceTicketId/);
assert.match(createModalSource, /<RunnerChat/);
assert.match(createModalSource, /onComposerSubmit=\{submitThreadBatch\}/);
assert.match(createModalSource, /footerClassName="batches-create-modal__footer"/);
assert.match(createModalSource, /targetKind === "metronome_run"/);
assert.match(createModalSource, /label: "Workflow"/);
assert.doesNotMatch(createModalSource, /label: "Metronome"/);
assert.match(createModalSource, /Add Job/);
assert.match(createModalSource, /value: "stay_on_shelf"/);
assert.match(createModalSource, /After a successful run, return this job to the shelf/);
assert.match(createModalSource, /existingManualJob/);
assert.match(createModalSource, /Start Job/);
assert.match(createModalSource, /Save Changes/);
assert.match(
  workspaceSource,
  /const saved = activeJob[\s\S]*await updateBatchJob[\s\S]*intent === "start"[\s\S]*await runBatchJobAction\(saved\.id, "start"/,
);
assert.match(createModalSource, /<MetronomeManualRunInputs/);
assert.match(createModalSource, /buildMetronomeManualRunInput/);
assert.match(createModalSource, /ariaLabel=\{`\$\{details\.label\} resource`\}/);
assert.match(createModalSource, /<PlatformPopupSearchHeader/);
assert.match(createModalSource, /popupMatchTriggerWidth="exact"/);
assert.doesNotMatch(createModalSource, />Resource ID</);
assert.doesNotMatch(createModalSource, />Version ID/);
assert.match(targetResourcesSource, /\/metronomes\?includeArchived=false&limit=500/);
assert.match(targetResourcesSource, /\/evaluations\?limit=500/);
assert.match(targetResourcesSource, /\/fine-tuning\/jobs\?view=overview&limit=100/);
assert.match(targetResourcesSource, /loadBatchMetronomeManualRunContext/);
assert.match(
  manualRunContextSource,
  /const versionsPath = `\/metronomes\/\$\{encodeURIComponent\(normalizedMetronomeId\)\}\/versions`/,
);
assert.doesNotMatch(
  manualRunContextSource,
  /\/versions\/\$\{encodeURIComponent\(normalizedVersionId\)\}/,
);
assert.match(manualRunContextSource, /fetch\(`\$\{baseUrl\}\/servers`/);
assert.match(targetResourcesSource, /\/projects\?view=overview/);
assert.match(
  targetResourcesSource,
  /\/tasks\/\$\{encodeURIComponent\(normalizedTicketId\)\}\/run-thread/,
);
assert.match(workspaceSource, /listBatchTargetResources/);
assert.match(workspaceSource, /loadBatchMetronomeManualRunContext/);
assert.match(workspaceSource, /prepareBatchProjectTicket/);
assert.match(BATCHES_PAGE_CSS, /\.batches-form-field\s*\{[\s\S]*?font-weight:\s*400;/);
assert.match(compositionSource, /resourceBackendUrl: proxyBackendBase/);
assert.match(compositionSource, /targetKind: "thread_run"/);
assert.match(compositionSource, /onBatchJobCreate: handleQuickBatchJobCreate/);
assert.match(bootstrapSource, /const handleQuickBatchJobCreate = useCallback/);
assert.match(bootstrapSource, /payload\?\.startPolicy !== "manual"/);
assert.match(bootstrapSource, /buildQuickBatchThreadJobDraft\(payload\)/);
assert.match(bootstrapSource, /basePath: proxyBackendBase \+ "\/batch-jobs"/);
assert.match(lifecycleSource, /function openBatchesOverviewPage/);
assert.match(lifecycleSource, /window\.computerAgentsOpenBatchComposer/);
assert.match(lifecycleSource, /window\.computerAgentsOpenBatch/);
assert.match(manualRunInputsSource, /lockAgentSelector=\{Boolean\(binding\)\}/);
assert.match(manualRunInputsSource, /lockEnvironmentSelector=\{Boolean\(binding\)\}/);
assert.match(manualRunContractsSource, /"thread_event"/);
assert.match(manualRunContractsSource, /"project_ticket"/);
assert.match(manualRunContractsSource, /"database_entry"/);
assert.match(manualRunContractsSource, /"auth"/);

const calls = [];
const service = createBatchesService({
  proxyUpstreamGet: (...args) => calls.push({ adapter: "get", args }),
  proxyUpstreamJsonRequest: (...args) => calls.push({ adapter: "json", args }),
});

function dispatch(method, pathname) {
  calls.length = 0;
  const req = { method, url: pathname, headers: {} };
  const res = {};
  const handled = service.handleRequest(req, res, new URL(pathname, "http://localhost"));
  return { handled, call: calls[0] };
}

let result = dispatch("GET", "/api/real/batch-jobs?status=queued&limit=20");
assert.equal(result.handled, true);
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/batch-jobs?status=queued&limit=20");

result = dispatch("GET", "/api/real/batch-jobs/batch%201");
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/batch-jobs/batch%201");

result = dispatch("POST", "/api/real/batch-jobs/batch_1/start");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/batch-jobs/batch_1/start");
assert.equal(result.call.args[3], "POST");

result = dispatch("PATCH", "/api/real/batch-jobs/batch_1");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[3], "PATCH");

result = dispatch("DELETE", "/api/real/batch-jobs/batch_1");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[3], "DELETE");

result = dispatch("GET", "/api/real/metronomes");
assert.equal(result.handled, false);

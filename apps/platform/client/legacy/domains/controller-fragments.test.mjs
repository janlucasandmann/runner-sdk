import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { AGENTS_CONTROLLER_FRAGMENT_PATHS } from "./agents/source.mjs";
import { SKILLS_CONTROLLER_FRAGMENT_PATHS } from "./skills/source.mjs";
import { PLATFORM_SHELL_CONTROLLER_FRAGMENT_PATHS } from "./shell/source.mjs";

const domainsRoot = path.dirname(fileURLToPath(import.meta.url));
const suites = [
  {
    domain: "agents",
    paths: AGENTS_CONTROLLER_FRAGMENT_PATHS,
    budget: 6_200,
  },
  {
    domain: "shell",
    paths: PLATFORM_SHELL_CONTROLLER_FRAGMENT_PATHS,
    budget: 6_200,
  },
  {
    domain: "skills",
    paths: SKILLS_CONTROLLER_FRAGMENT_PATHS,
    budget: 1_400,
  },
];

for (const suite of suites) {
  assert.ok(
    suite.paths.length >= (suite.domain === "skills" ? 3 : 5),
    `${suite.domain} must remain decomposed into responsibility fragments.`,
  );
  for (const relativePath of suite.paths) {
    const source = await fs.readFile(path.join(domainsRoot, suite.domain, relativePath), "utf8");
    const lineCount = source.split("\n").length;
    assert.ok(
      lineCount <= suite.budget,
      `${suite.domain}/${relativePath} exceeded ${suite.budget} lines (${lineCount}).`,
    );
  }
}

const agentComposerSource = await fs.readFile(
  path.join(domainsRoot, "agents/controller/composer-and-overview.template.js"),
  "utf8",
);
const agentMutationsSource = await fs.readFile(
  path.join(domainsRoot, "agents/controller/mutations-access-and-versioning.template.js"),
  "utf8",
);
const agentDialogsSource = await fs.readFile(
  path.join(domainsRoot, "agents/controller/dialogs-and-detail-view.template.js"),
  "utf8",
);
const agentBootstrapSource = await fs.readFile(
  path.join(domainsRoot, "agents/controller/bootstrap-and-lifecycle.template.js"),
  "utf8",
);
const shellBootstrapSource = await fs.readFile(
  path.join(domainsRoot, "shell/controller/bootstrap-account-and-connectors.template.js"),
  "utf8",
);
const shellDataLifecycleSource = await fs.readFile(
  path.join(domainsRoot, "shell/controller/data-lifecycle-and-navigation.template.js"),
  "utf8",
);
const shellApplicationLifecycleSource = await fs.readFile(
  path.join(domainsRoot, "shell/controller/application-lifecycle-and-history.template.js"),
  "utf8",
);
const shellCompositionSource = await fs.readFile(
  path.join(domainsRoot, "shell/controller/composition-and-modals.template.js"),
  "utf8",
);
const platformTemplateSource = await fs.readFile(
  path.join(domainsRoot, "../templates/platform.template.js"),
  "utf8",
);
const platformTemplateCss = await fs.readFile(
  path.join(domainsRoot, "../templates/platform.template.css"),
  "utf8",
);

assert.match(
  agentComposerSource,
  /const preserveDraftName = Boolean\(options\?\.preserveDraftName\)/,
  "The standard agent creation flow must support prefilled names.",
);
assert.match(
  agentMutationsSource,
  /function openCurrentAgentCopyModal\(\)\s*\{[\s\S]*?openAgentCreationSetupOverlay\([\s\S]*?buildSingleAgentCopyDraft\(/,
  "Copy Agent must open the standard prefilled creation modal as an overlay.",
);
assert.doesNotMatch(
  agentMutationsSource.match(/function openCurrentAgentCopyModal\(\)\s*\{[\s\S]*?\n\s*\}/)?.[0] ||
    "",
  /openAgentDraftDetail/,
  "Opening Copy Agent from a detail page must not navigate to a draft route.",
);
assert.match(
  agentDialogsSource,
  /openCurrentAgentCopyModal\(\);[\s\S]{0,500}"Copy Agent"/,
  "The agent detail Copy Agent action must use the standard creation modal.",
);
assert.match(
  agentDialogsSource,
  /openAgentSendToTeamModal\(draftAgent\);[\s\S]{0,500}"Send to Team"/,
  "The agent title action menu must pass the current agent explicitly when opening the team publishing modal.",
);
assert.match(
  agentDialogsSource,
  /React\.createElement\(PlatformUiCard, \{[\s\S]{0,180}variant: "sidebar",[\s\S]{0,120}cardTitle: "About"/,
  "The Agent About sidebar section must use the centralized sidebar card.",
);
assert.doesNotMatch(
  agentDialogsSource,
  /cardTitle: "Actions"/,
  "Agent actions must not remain duplicated in the detail sidebar.",
);
assert.match(
  agentDialogsSource,
  /const agentsTitleActions = titleActionsContainer && canShowAgentActions[\s\S]{0,300}React\.createElement\(PlatformPopup, \{[\s\S]{0,900}variant: "minimal"[\s\S]{0,900}React\.createElement\(Ellipsis,/,
  "Agent actions must use a centralized minimal popup beside the title.",
);
assert.match(
  agentDialogsSource,
  /surfaceProps: \{[\s\S]{0,180}width: 360,[\s\S]{0,100}maxWidth: "calc\(100vw - 16px\)"/,
  "The Agent title action popup must provide enough responsive width for a complete one-line identifier.",
);
assert.match(
  agentDialogsSource,
  /className: "playground-agents-detail-action-menu-meta-value"[\s\S]{0,100}label === "ID" \? " is-id" : ""/,
  "The Agent title action popup must distinguish its ID value so the complete identifier can remain visible.",
);
assert.match(
  platformTemplateCss,
  /\.playground-agents-detail-action-menu-meta-value\.is-id\s*\{[\s\S]{0,180}white-space:\s*nowrap;/,
  "The Agent title action popup must keep its complete identifier on one line.",
);
const agentTitleActionsSource = agentDialogsSource.match(
  /const agentsTitleActions =[\s\S]*?\n\s*const agentsTopNavActions =/,
)?.[0] || "";
for (const itemLabel of ["Send to Team", "Use via API", "Copy Agent", "Rename", "Delete"]) {
  assert.match(
    agentTitleActionsSource,
    new RegExp(`"${itemLabel}"`),
    `The Agent title popup must include ${itemLabel}.`,
  );
}
const agentTopNavActionsSource = agentDialogsSource.match(
  /const agentsTopNavActions =[\s\S]*?\n\s*const agentDetailLayoutClass =/,
)?.[0] || "";
assert.match(
  agentTopNavActionsSource,
  /renderAgentPublishAction\(\)/,
  "The Agent app-header actions must retain Save & Publish.",
);
assert.doesNotMatch(
  agentTopNavActionsSource,
  /Ellipsis|Agent actions/,
  "The Agent app-header action area must not retain the old ellipsis menu.",
);
assert.match(
  shellCompositionSource,
  /resourcesDetailVersionLabel[\s\S]{0,1600}id: "playground-agent-title-actions"/,
  "The Agent action target must render beside the resource title and version label.",
);
assert.match(
  shellCompositionSource,
  /titleActionsPortalId: "playground-agent-title-actions"/,
  "The Agent detail controller must receive the title action portal target.",
);
assert.doesNotMatch(
  agentDialogsSource,
  /cardTitle: "Permissions"/,
  "Agent permissions must be managed from Settings rather than a redundant sidebar card.",
);
assert.doesNotMatch(
  agentDialogsSource,
  /cardTitle: "Owner"/,
  "Agent ownership must live in About rather than a separate sidebar card.",
);
assert.match(
  agentDialogsSource,
  /renderAgentFactRow\(\s*"Owner",\s*renderAgentOwnerRow\(\{ compact: true, alignment: "end" \}\),[\s\S]{0,220}className: "playground-agents-detail-about-owner-row"[\s\S]{0,160}valueClassName: "playground-agents-detail-about-owner-control"/,
  "The Agent About card must render the owner selector as its final divided property row.",
);
assert.match(
  agentDialogsSource,
  /const instructionsSection = React\.createElement\(PlatformInstructionsEditor, \{[\s\S]{0,700}variant: "minimalistic-ui",[\s\S]{0,120}className: "playground-agent-detail-instructions-editor"/,
  "The Agent details instructions editor must use the centralized minimalistic UI variant.",
);
assert.match(
  agentDialogsSource,
  /const instructionsSection = React\.createElement\(PlatformInstructionsEditor, \{[\s\S]{0,220}title: agentProfileSection/,
  "The General editor must use the editable Agent identity as its title.",
);
assert.doesNotMatch(
  agentDialogsSource,
  /header: agentProfileSection|sidebarToggle: agentDetailSidebarToggle/,
  "The Agent detail body must not duplicate its identity or sidebar toggle above the content.",
);
assert.match(
  agentBootstrapSource,
  /activeSection: activeHeaderSection,[\s\S]{0,120}onSectionChange: \(nextSection\)/,
  "The Agent detail controller must publish its active section to the app header.",
);
assert.match(
  shellCompositionSource,
  /className: "playground-agent-detail-header-switch"[\s\S]{0,500}\{ value: "general", label: "General" \}[\s\S]{0,120}\{ value: "insights", label: "Insights" \}[\s\S]{0,120}\{ value: "settings", label: "Settings" \}/,
  "Agent detail navigation must use the centralized app-header switch.",
);
assert.match(
  platformTemplateCss,
  /\.playground-agents-detail-content \.platform-instructions-editor\.is-minimalistic-ui\.playground-agent-detail-instructions-editor\s*\{[\s\S]{0,260}border:\s*0;[\s\S]{0,160}border-radius:\s*0;[\s\S]{0,160}background:\s*transparent;/,
  "The Agent details minimal instructions editor must not render a framed outer surface.",
);
assert.match(
  platformTemplateCss,
  /\.playground-agent-detail-instructions-editor\.is-minimalistic-ui \.platform-instructions-editor__header\s*\{[\s\S]{0,180}background:\s*#000 !important;/,
  "The Agent details instructions editor header must use a black background.",
);
assert.match(
  platformTemplateCss,
  /\.playground-agent-detail-instructions-editor\.is-minimalistic-ui \.platform-instructions-editor__body\s*\{[\s\S]{0,180}padding:\s*12px 0 0;/,
  "The Agent details instructions content must retain twelve pixels of top padding.",
);
assert.match(
  platformTemplateCss,
  /\.playground-agents-detail-about-owner-row\s*\{[\s\S]{0,160}margin-top:\s*12px;[\s\S]{0,120}padding-top:\s*12px;[\s\S]{0,140}border-top:\s*1px solid rgba\(255, 255, 255, 0\.1\);/,
  "The Agent About owner row must use the centralized divided-owner spacing.",
);
assert.match(
  agentDialogsSource,
  /React\.createElement\(PlatformResourceAccessSettings, \{[\s\S]{0,800}subjectType: "agent_resource",[\s\S]{0,120}teamSubjectType: "agent_team_role"/,
  "Agent access settings must separate system resource policies from team-role policies.",
);
assert.match(
  agentDialogsSource,
  /const handleAgentAccessPrincipalChange[\s\S]{0,700}isPlatformSystemAccessPrincipalId[\s\S]{0,700}setAgentDetailSidebarCollapsed\(true\)/,
  "Opening a physical Agent access team must make room for the centralized role sidebar.",
);
assert.match(
  agentDialogsSource,
  /const restoreAgentDetailSidebarAfterAccess[\s\S]{0,500}agentDetailSidebarCollapsedBeforeAccessRef\.current = null/,
  "Leaving Agent team permissions must restore the previous detail-sidebar state.",
);
assert.match(
  agentDialogsSource,
  /const agentSettingsPermissionsSummary = React\.createElement\([\s\S]{0,120}PlatformPermissionsSettingsSummary,[\s\S]{0,700}title: "Agent Permissions",[\s\S]{0,220}tooltip: "Controls the permissions this agent has when working\.",[\s\S]{0,120}editLabel: "Manage",[\s\S]{0,300}variant: "default",[\s\S]{0,200}onEdit: \(\) => setAgentDetailTab\("permissions"\)/,
  "Agent Settings must render the full-size permission summary with contextual help and a Manage action.",
);
assert.match(
  agentDialogsSource,
  /titleTooltip: "Controls the access levels and permissions users inside teams have when editing or managing this agent\."/,
  "Agent access management must explain that team policies govern users who edit or manage the Agent.",
);
assert.match(
  agentDialogsSource,
  /const agentSettingsSection = agentAccessPrincipalId\s*\?\s*agentAccessSettingsSection\s*:\s*React\.createElement\([\s\S]{0,300}agentSettingsPermissionsSummary,[\s\S]{0,120}agentAccessSettingsSection,[\s\S]{0,120}agentGuardrailsSection[\s\S]{0,300}normalizedAgentDetailTab === "settings"\s*\?\s*agentSettingsSection/,
  "Agent Settings must place Agent Permissions above Manage Access, include Guardrails, and isolate principal permission subpages.",
);
assert.match(
  agentDialogsSource,
  /permissions: \{[\s\S]{0,220}backLabel: "Settings",[\s\S]{0,120}onBack: \(\) => setAgentDetailTab\("settings"\)/,
  "The full Agent permission editor must provide explicit Settings back navigation.",
);
assert.match(
  agentDialogsSource,
  /agentDetailTab === "guardrails"[\s\S]{0,80}\? "settings"/,
  "Legacy Guardrails tab state must migrate to Settings.",
);
assert.match(
  agentDialogsSource,
  /const agentInsightsTableTabs = React\.createElement\(PlatformDetailTabBar,[\s\S]{0,700}\{ id: "threads", label: "Threads" \},[\s\S]{0,120}\{ id: "evaluations", label: "Evaluations" \}/,
  "Agent Insights must provide adjacent Threads and Evaluations table tabs.",
);
assert.match(
  agentDialogsSource,
  /const emptyAgentThreadsState = React\.createElement\(PlatformEmptyState,[\s\S]{0,220}title: "No threads yet"/,
  "Agent Threads must define its empty state with the centralized component.",
);
assert.match(
  agentDialogsSource,
  /emptyState: agentDetailThreadFilterMode === "all"\s*\?\s*emptyAgentThreadsState/,
  "Agent Threads must render the centralized empty state when no filter is active.",
);
assert.match(
  agentDialogsSource,
  /const agentInsightsSection = React\.createElement\(React\.Fragment,[\s\S]{0,220}resolvedAgentInsightsTableMode === "evaluations"\s*\?\s*agentEvaluationsSection\s*:\s*agentThreadsSection/,
  "Agent Insights must switch Threads and Evaluations inside one data region.",
);
assert.match(
  agentDialogsSource,
  /agentDetailTab === "threads" \|\| agentDetailTab === "evaluation"[\s\S]{0,80}\? "insights"/,
  "Legacy Evaluation tab state must migrate to Insights.",
);
assert.match(
  agentMutationsSource,
  /function updateAgentTeamRoleAccessPermissionSet[\s\S]{0,900}normalizePlaygroundPermissionSet\(permissionSet, "agent_team_role"\)[\s\S]{0,500}queueAgentAccessPermissionSave\(nextAgent, normalizedTeamId\)/,
  "Agent role edits must use the Agent-resource entitlement catalog and queue the affected team.",
);
assert.match(
  agentMutationsSource,
  /async function flushQueuedAgentAccessPermissionSave[\s\S]{0,1200}for \(const teamId of teamIds\) \{\s*await syncAgentTeamResourceShare\(savedAgent, teamId\)/,
  "Agent permission saves must synchronize every affected team resource share.",
);
assert.match(
  agentDialogsSource,
  /const isAgentActionTargetConfigurationLocked =\s*isPlaygroundDefaultAgentConfigurationLocked\(draftAgent\);/,
  "The agent title action menu must derive its lock state from the shared default-agent helper.",
);
assert.match(
  agentDialogsSource,
  /disabled:\s*saveState\.isSaving \|\| isAgentActionTargetConfigurationLocked,[\s\S]{0,300}"Send to Team"/,
  "The agent title action menu must disable Send to Team for default agents.",
);
assert.match(
  agentDialogsSource,
  /const renderAgentReadonlyModelValue\s*=[\s\S]*?React\.createElement\("button",\s*\{[\s\S]*?playground-agents-detail-about-model-readonly[\s\S]*?disabled:\s*true,/,
  "Default-agent model values must render as native disabled buttons.",
);
assert.match(
  agentBootstrapSource,
  /maxHeight: "75vh"/,
  "The standard agent creation modal must remain viewport constrained.",
);
assert.match(
  agentBootstrapSource,
  /const AGENT_THREAD_FETCH_LIMIT = 20;[\s\S]*?fetch\(backendUrl \+ "\/threads\?limit=" \+ AGENT_THREAD_FETCH_LIMIT[\s\S]*?\.slice\(0, AGENT_THREAD_FETCH_LIMIT\)/,
  "Agent detail thread loading must request and retain no more than 20 threads.",
);
assert.match(
  agentBootstrapSource,
  /function updateDraftAgent\(updater\)[\s\S]{0,800}stringifyPlaygroundVersionComparableValue\(next\)[\s\S]{0,300}editorDirtyRef\.current = true;[\s\S]{0,120}agentVersionDraftTouchedRef\.current = true;/,
  "Agent draft callbacks must only mark a resource dirty when they change its hydrated value.",
);
assert.match(
  agentBootstrapSource,
  /rememberAgentVersionBaseline\(agentWithVersions, \{ force: true \}\)[\s\S]*?rememberAgentVersionBaseline\(nextAgent, \{ force: true \}\)/,
  "Authoritative Agent version and detail hydration must replace the provisional baseline.",
);
assert.doesNotMatch(
  agentBootstrapSource,
  /fetch\(backendUrl \+ "\/threads\?limit=240"/,
  "Agent detail thread loading must not request the legacy 240-thread page.",
);
assert.match(
  platformTemplateCss,
  /\.playground-agents-creation-modal-body\.platform-modal-body\s*\{[\s\S]*?overflow-y: auto !important;/,
  "The agent creation modal body must own vertical scrolling.",
);
assert.match(
  platformTemplateCss,
  /\.playground-agents-detail-about-model-readonly:disabled\s*\{[\s\S]*?opacity:\s*0\.42;/,
  "The disabled default-agent model control must use the sidebar disabled appearance.",
);
assert.match(
  shellBootstrapSource,
  /const realAgentsRef = useRef\(\[\]\);[\s\S]*?const agentRefreshInFlightRef = useRef\(/,
  "The shell must retain the current agent list and deduplicate concurrent refreshes.",
);
assert.match(
  shellBootstrapSource,
  /buildPlaygroundAgentListScopeKey\(\{[\s\S]*?identity:[\s\S]*?sessionState\.userId/,
  "Agent list caches must include the authenticated user identity.",
);
assert.match(
  shellDataLifecycleSource,
  /const inFlight = agentRefreshInFlightRef\.current;[\s\S]*?return inFlight\.promise;/,
  "Concurrent agent list requests must share one in-flight request.",
);
assert.match(
  shellDataLifecycleSource,
  /if \(!response\.ok\) \{[\s\S]*?realAgentsRef\.current[\s\S]*?cached\?\.agents \|\| \[\]/,
  "Transient agent list failures must preserve the last valid scoped list.",
);
assert.doesNotMatch(
  shellDataLifecycleSource.match(/if \(!response\.ok\) \{[\s\S]*?\n\s*\}/)?.[0] || "",
  /setRealAgents\(\[\]\)/,
  "Transient agent list failures must not clear ticket assignees.",
);
assert.match(
  shellApplicationLifecycleSource,
  /activePage === "tasks"[\s\S]*?activePage === "calendar"[\s\S]*?Boolean\(threadTaskOpenRequest\)[\s\S]*?retryDelays/,
  "Ticket pages and the ticket drawer must recover an initially empty agent list.",
);
assert.match(
  platformTemplateSource,
  /normalizePlatformAgentListRecords\(data\)\.map\(normalizePlaygroundAgentRecord\)/,
  "The legacy shell must consume the typed Agent list normalization boundary.",
);

const agentApiModalSource =
  agentComposerSource.match(
    /function renderAgentApiModal\(\)\s*\{[\s\S]*?\n\s*function EnvironmentsHomeResponsiveSvgShared/,
  )?.[0] || "";
assert.match(
  agentApiModalSource,
  /React\.createElement\(PlatformModal,\s*\{[\s\S]*?size:\s*"medium"[\s\S]*?title:\s*"Use via API"/,
  "The agent API dialog must use the centralized medium modal.",
);
assert.doesNotMatch(
  agentApiModalSource,
  /playground-tasks-project-modal-top/,
  "The agent API dialog must not recreate the legacy project modal header.",
);
assert.match(
  agentApiModalSource,
  /React\.createElement\(PlatformSelector,\s*\{[\s\S]*?popupAlignment:\s*"right"[\s\S]*?className:\s*"playground-agent-api-environment-selector"/,
  "The agent API computer picker must use the centralized selector and its minimal popup.",
);
assert.doesNotMatch(
  agentApiModalSource,
  /playground-agent-api-environment-select-popup/,
  "The agent API computer picker must not recreate the legacy popup.",
);

const agentSendToTeamModalSource =
  agentComposerSource.match(
    /function renderAgentSendToTeamModal\(\)\s*\{[\s\S]*?\n\s*function renderAgentAddToSquadModal/,
  )?.[0] || "";
assert.match(
  agentSendToTeamModalSource,
  /React\.createElement\(PlatformModal,\s*\{[\s\S]*?size:\s*"medium"[\s\S]*?bodyClassName:\s*"playground-agents-send-team-modal-body"[\s\S]*?footer:/,
  "The agent team publishing flow must use the centralized medium modal.",
);
assert.doesNotMatch(
  agentSendToTeamModalSource,
  /playground-tasks-project-modal-top/,
  "The agent team publishing modal must not recreate the legacy project modal header.",
);

console.log("Legacy agent, shell, and skills controller fragment budgets passed.");

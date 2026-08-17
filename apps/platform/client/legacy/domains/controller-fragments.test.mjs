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
const agentAssistantSource = await fs.readFile(
  path.join(domainsRoot, "agents/controller/assistant-and-composition.template.js"),
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
const shellSettingsToolsSource = await fs.readFile(
  path.join(domainsRoot, "shell/controller/settings-tools-and-rendering.template.js"),
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
const skillRenderingSource = await fs.readFile(
  path.join(domainsRoot, "skills/controller/03-rendering-and-composition.js"),
  "utf8",
);
const skillStateSource = await fs.readFile(
  path.join(domainsRoot, "skills/controller/01-state-and-data.js"),
  "utf8",
);
const skillActionsSource = await fs.readFile(
  path.join(domainsRoot, "skills/controller/02-actions-and-editors.js"),
  "utf8",
);
const skillTitleActionsSource = await fs.readFile(
  path.join(domainsRoot, "skills/controller/03-title-actions-and-sharing.js"),
  "utf8",
);
const skillDetailIdentityAndSettingsSource = await fs.readFile(
  path.join(domainsRoot, "skills/controller/03-detail-identity-and-settings.js"),
  "utf8",
);
const skillVersioningSource = await fs.readFile(
  path.join(domainsRoot, "skills/controller/03-versioning-and-shortcuts.js"),
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
const runnerChatSource = await fs.readFile(
  path.join(domainsRoot, "../../../../../src/react/runner-chat.tsx"),
  "utf8",
);

const pendingThreadRunRequestBlocks = Array.from(
  shellCompositionSource.matchAll(/setPendingThreadRunRequest\(\{([\s\S]*?)\n\s*\}\);/g),
  (match) => match[1],
);
assert.equal(
  pendingThreadRunRequestBlocks.length,
  6,
  "Every shell thread-start surface must continue using the audited pending-run handoff.",
);
for (const pendingRunRequestBlock of pendingThreadRunRequestBlocks) {
  assert.match(
    pendingRunRequestBlock,
    /connectors: options\.taskRunRequest\.connectors \|\| null/,
    "Pending thread runs must preserve selected connectors while navigating to the thread screen.",
  );
}
const agentsHomeThreadStartSource = agentBootstrapSource.match(
  /function handleAgentsHomeThreadStartRequest\(runRequest\)[\s\S]*?(?=\n\s*function buildAgentCreationEnabledSkillsPayload)/,
)?.[0] || "";
assert.match(
  agentsHomeThreadStartSource,
  /connectors: runRequest\.connectors \|\| null/,
  "The Agents home handoff must preserve selected connectors.",
);

assert.match(
  shellSettingsToolsSource,
  /const tagsAndPluginsOverviewMenu =[\s\S]{0,600}React\.createElement\(PlatformPopup,[\s\S]{0,900}variant: "minimal"[\s\S]{0,1400}"Disconnect all tags"[\s\S]{0,900}"Documentation"/,
  "Connector overview actions must use the centralized minimal popup beside the app-header title.",
);
assert.match(
  shellSettingsToolsSource,
  /label: toolsOverviewTitle,[\s\S]{0,180}trailing: isSkillsView[\s\S]{0,120}: tagsAndPluginsOverviewMenu/,
  "The Connectors action menu must trail its app-header title.",
);
assert.match(
  shellSettingsToolsSource,
  /openDocsPage\(\)[\s\S]{0,300}"Documentation"/,
  "The Connectors documentation action must open the configured developer docs.",
);
assert.match(
  shellSettingsToolsSource,
  /function renderPluginsPageNav\(\)[\s\S]{0,1200}handleSettingsUnlinkEmail\(\)[\s\S]{0,300}handleSettingsUnlinkDiscord\(\)[\s\S]{0,300}handleSettingsUnlinkTelegram\(\)/,
  "Disconnect all tags must reuse every channel disconnect flow.",
);
assert.match(
  shellSettingsToolsSource,
  /\(isPluginsView \|\| isTagsView\) && !isPluginsDetailView[\s\S]{0,300}React\.createElement\(PlatformPrimaryButton,[\s\S]{0,400}playground-tags-plugins-custom-webhooks-action[\s\S]{0,300}requestPlatformNavigation\(\(\) => openDevelopWebhooksPage\(\)\)[\s\S]{0,200}"Custom Webhooks"/,
  "The Connectors overview must link its app-header primary action to Develop Webhooks.",
);
assert.match(
  shellSettingsToolsSource,
  /const toolsOverviewTitle =[\s\S]{0,180}: "Connectors";/,
  "The connector page must use the Connectors app-header label.",
);
assert.match(
  shellSettingsToolsSource,
  /return listPlatformConnectorCatalogEntries\("plugin"\)\.map\(\(catalogEntry\) =>/,
  "The Connectors overview must project every plugin from the canonical connector catalog.",
);
assert.match(
  shellSettingsToolsSource,
  /function usesProviderManagedConnectorCredentials\(resourceId\)[\s\S]{0,240}getPlaygroundIntegrationProvider/,
  "Provider-backed connector credentials must be owned by the connector service.",
);
assert.match(
  shellBootstrapSource,
  /const refreshPluginConnectionStatus = useCallback\([\s\S]{0,1200}const refreshGithubStatus = useCallback\([\s\S]{0,1600}const refreshGenericConnectorStatus = useCallback\(/,
  "Connector status refresh callbacks must remain stable so status updates cannot restart the overview effect.",
);
assert.doesNotMatch(
  platformTemplateSource,
  /import \{[^\n]+\} from "\/api\/platform\/auth\/browser-module\.js"/,
  "Firebase must not block the platform's initial module graph.",
);
assert.match(
  platformTemplateSource,
  /function loadPlaygroundFirebaseBrowserModule\(\)[\s\S]{0,500}import\("\/api\/platform\/auth\/browser-module\.js"\)/,
  "Firebase must load lazily only when an authentication operation needs it.",
);
assert.match(
  platformTemplateSource,
  /PLAYGROUND_AUTH_SESSION_SNAPSHOT_MAX_AGE_MS = 5 \* 60 \* 1000[\s\S]*?function readPlaygroundAuthSessionSnapshot\(\)[\s\S]{0,500}readPlaygroundAuthSessionMarker\(\)/,
  "Reload acceleration must use a short-lived, tab-scoped snapshot backed by a verified session marker.",
);
assert.match(
  shellBootstrapSource,
  /const \[sessionState, setSessionState\] = useState\(\(\) => \{[\s\S]{0,300}readPlaygroundAuthSessionSnapshot\(\)/,
  "A verified session snapshot must reveal the shell without another full-screen reload gate.",
);
const refreshSessionStateSource = shellBootstrapSource.match(
  /const refreshSessionState = useCallback[\s\S]*?(?=\n\s+useEffect\(\(\) => \{\n\s+if \(isDemoMode\))/,
)?.[0] || "";
assert.match(
  refreshSessionStateSource,
  /fetchJsonWithTimeout\("\/api\/aios\/user\/profile"/,
  "Reload authentication must use the profile-only critical endpoint.",
);
assert.match(
  platformTemplateSource,
  /async function buildRunnerAuthenticatedRequestHeaders\(requestHeaders\)[\s\S]{0,500}syncFirebaseSessionCookieFromCurrentUser\(false\)[\s\S]{0,500}Authorization: "Bearer " \+ idToken/,
  "Connector runs must refresh and forward the verified Firebase bearer token just in time.",
);
assert.match(
  shellBootstrapSource,
  /const resolveRunnerRequestHeaders = useCallback\([\s\S]{0,200}buildRunnerAuthenticatedRequestHeaders\(authRequestHeaders\)/,
  "The shell must resolve connector-run authentication from the centralized platform auth helper.",
);
assert.match(
  shellCompositionSource,
  /speechToTextUrl: speechToTextUrl \|\| undefined,\s*requestHeaders,\s*resolveRequestHeaders: resolveRunnerRequestHeaders/,
  "The primary RunnerChat surface must receive the just-in-time authenticated header resolver.",
);
assert.match(
  refreshSessionStateSource,
  /const nextSessionState = \{[\s\S]{0,100}status: "authenticated"[\s\S]{0,1600}setSessionState\(nextSessionState\)[\s\S]{0,100}void \(async \(\) => \{[\s\S]{0,500}\/api\/aios\/user\/streaming-key/,
  "The verified shell must render before runner access hydrates in the background.",
);
assert.doesNotMatch(
  refreshSessionStateSource,
  /\/billing\/budget/,
  "Billing hydration must never hold the full application loading screen open.",
);
assert.match(
  refreshSessionStateSource,
  /status: current\.status === "authenticated" \? "authenticated" : "loading"/,
  "Background revalidation must keep an already verified shell visible.",
);
assert.match(
  shellDataLifecycleSource,
  /function listManagedConnectorStatusProviderIds\(\)[\s\S]{0,500}listPlatformConnectorCatalogEntries\("plugin"\)[\s\S]{0,900}forceRefresh: true/,
  "Every provider-managed connector must rehydrate from server state after authentication.",
);
assert.match(
  shellBootstrapSource,
  /if \(connectorAuthReturnState\) restoreTagPluginConnectionReturnTarget\(connectorAuthReturnState\);[\s\S]{0,300}listManagedConnectorStatusProviderIds\(\)/,
  "OAuth returns must restore the exact connector detail before refreshing its status.",
);
assert.match(
  shellBootstrapSource,
  /useLayoutEffect\(\(\) => \{\s*const urlConnectorRestoreState = consumePlaygroundConnectorBrowserRestoreUrlState\(\);\s*const connectorAuthReturnState = consumePlaygroundPluginConnectionReturnUrlState\(\);/,
  "OAuth returns must restore the connector Authentication tab before the first post-callback paint.",
);
assert.doesNotMatch(
  shellApplicationLifecycleSource,
  /const pollThreadStatus\s*=|setInterval\([\s\S]{0,500}loadThreadGroundTruthStatus/,
  "The shell must not duplicate RunnerChat's active-thread status polling.",
);
const updateRealThreadStatusSource = shellDataLifecycleSource.match(
  /const updateRealThreadStatus = useCallback[\s\S]*?(?=\n\s+const upsertRealThreadTitle)/,
)?.[0] || "";
assert.match(
  updateRealThreadStatusSource,
  /existingThread[\s\S]*String\(existingThread\.status[\s\S]*String\(existingThread\.completedAt[\s\S]*return;[\s\S]*emitThreadListRefreshSignal/,
  "Unchanged thread lifecycle status must not emit another cross-tab refresh signal.",
);
const runnerThreadStatusChangeSource = shellCompositionSource.match(
  /onThreadStatusChange:\s*\(threadId, nextStatus\) => \{[\s\S]*?(?=\n\s+onRunFinish:)/,
)?.[0] || "";
assert.match(
  runnerThreadStatusChangeSource,
  /normalizedStatus === "permission_asked"[\s\S]{0,180}refreshThreads/,
  "Permission transitions must still refresh the thread list immediately.",
);
assert.doesNotMatch(
  runnerThreadStatusChangeSource,
  /normalizedStatus === "running"[\s\S]{0,180}refreshThreads/,
  "Repeated running status notifications must not refetch the complete thread list.",
);
assert.match(
  shellCompositionSource,
  /threadViewMode: "legacy"/,
  "The platform thread page must keep the initially rendered transcript instead of replacing it after canonical hydration.",
);
assert.match(
  shellCompositionSource,
  /executionWorkbenchOpen: threadExecutionWorkbenchOpen[\s\S]{0,180}onExecutionWorkbenchAvailabilityChange: setThreadExecutionWorkbenchAvailable/,
  "The normal transcript must retain the opt-in canonical execution-details sidebar.",
);
assert.doesNotMatch(
  runnerChatSource,
  /RunnerThreadRunActivityCard/,
  "The normal transcript must not render permission-group navigation in its working-log section.",
);
assert.match(
  runnerChatSource,
  /const workLogSection = shouldRenderWorkSection\s*\?\s*\([\s\S]{0,300}<RunnerWorkStatusDisclosure/,
  "The normal transcript must render its working-log lines through the centralized turn component.",
);
assert.match(
  runnerChatSource,
  /<RunnerWorkStatusDisclosure[\s\S]{0,500}items=\{workLogItems\}/,
  "The centralized working-status disclosure must receive the normalized working-log items.",
);
assert.match(
  runnerChatSource,
  /isToolCall: isRunnerTimelineToolCallItem\(item\)/,
  "Every RunnerChat instance must identify tool calls for the collapsed working-log preview.",
);
assert.match(
  runnerChatSource,
  /const hasRunSummary = Boolean\(agentMessage\?\.message\?\.trim\(\)\);\s*const isTurnActivelyWorking = isTurnRunning && !hasRunSummary;/,
  "The working state must end when the authoritative run summary arrives.",
);
assert.match(
  runnerChatSource,
  /showCollapsedPreview=\{!hasRunSummary\}/,
  "A received run summary must hide the collapsed working-log preview without removing expandable history.",
);
assert.match(
  platformTemplateSource,
  /client\.listThreadTimeline\([\s\S]{0,500}limit: 500/,
  "The Activity tab must load the canonical mixed thread timeline.",
);
assert.match(
  platformTemplateSource,
  /buildRunnerThreadActivityTree\(\{[\s\S]{0,500}items: canonicalTimelineItems[\s\S]{0,500}planSteps: threadPlanSteps/,
  "The Activity tab must adapt the canonical timeline into one nested execution tree.",
);
assert.match(
  platformTemplateSource,
  /flattenRunnerThreadActivityTree\([\s\S]{0,500}collapsedActivityItemIds/,
  "The Activity tab must apply expansion state to the canonical execution tree.",
);
assert.match(
  platformTemplateSource,
  /const chartRecordSource = canonicalActivityTreeRecords\.length > 0[\s\S]{0,500}const chartRecords = chartRecordSource\.filter[\s\S]{0,300}\["message", "activity_group", "tool_call"\]\.includes\(record\.recordKind\)/,
  "The Activity chart must render user messages, action groups, and tool calls.",
);
assert.match(
  platformTemplateSource,
  /const chartParentById = new Map\(\)[\s\S]{0,900}chartParentById\.set\(record\.id, chartParentId\)/,
  "The Activity chart must retain group-to-tool-call hierarchy after plan steps are removed.",
);
assert.match(
  platformTemplateSource,
  /overviewProps: \{[\s\S]{0,450}timelineLayout: "scroll"/,
  "The thread Activity chart must pan the selected time window through horizontal scrolling.",
);
assert.doesNotMatch(
  shellCompositionSource,
  /ariaLabel: "Activity detail level"/,
  "The Activity tab must not split the execution tree across mutually exclusive detail modes.",
);
assert.match(
  platformTemplateSource,
  /function renderCanonicalThreadActivityPreview[\s\S]{0,500}record\.actions[\s\S]{0,2500}renderTracePermissionRingIcon/,
  "Canonical Activity inspector entries must expose their permission-grouped actions.",
);
assert.match(
  shellDataLifecycleSource,
  /activePage !== "tools"[\s\S]{0,200}toolsView !== "plugins"[\s\S]{0,100}toolsView !== "tags"[\s\S]{0,1800}requestIdleCallback/,
  "Connector status fan-out must remain page-scoped and deferred until browser idle time.",
);
assert.match(
  shellSettingsToolsSource,
  /async function persistTagPluginCredentials\(resourceId, credentials\)[\s\S]{0,700}usesProviderManagedConnectorCredentials\(normalizedResourceId\)[\s\S]{0,120}return nextConfig;[\s\S]{0,160}saveTagDetailConfig/,
  "Starting a provider OAuth flow must not persist pending credentials through tag settings.",
);
assert.match(
  shellSettingsToolsSource,
  /surfaceProps: \{[\s\S]{0,180}"aria-label": "Connectors actions"/,
  "The Connectors title action must use the matching accessible label.",
);
assert.match(
  platformTemplateCss,
  /\.playground-tasks-toolbar-popup-shell \.playground-tags-plugins-title-menu\s*\{[\s\S]{0,260}left: 0;[\s\S]{0,160}min-width: 220px;/,
  "The Tags and Plugins title menu must open below and toward the content side of its trigger.",
);
assert.match(
  platformTemplateCss,
  /\.playground-thread-nav-popup-shell \.playground-thread-nav-popup-menu\s*\{[\s\S]{0,180}right: auto;[\s\S]{0,80}left: 0;[\s\S]{0,240}transform-origin: top left;/,
  "The thread title menu must align its left edge with the title action trigger.",
);
assert.match(
  shellSettingsToolsSource,
  /const skillsOverviewMenu =[\s\S]{0,700}React\.createElement\(PlatformPopup,[\s\S]{0,900}variant: "minimal"[\s\S]{0,1200}"Skills actions"[\s\S]{0,1200}openDocsPage\(\)[\s\S]{0,300}"Documentation"/,
  "The Skills overview must expose its documentation in a minimal app-header title menu.",
);
assert.match(
  shellSettingsToolsSource,
  /label: toolsOverviewTitle,[\s\S]{0,180}trailing: isSkillsView[\s\S]{0,100}\? skillsOverviewMenu/,
  "The Skills action menu must trail the app-header title.",
);
assert.match(
  shellSettingsToolsSource,
  /React\.createElement\(PlaygroundSkillsPage,[\s\S]{0,700}currentUserName: hasSessionAuth \? accountName : "Me"[\s\S]{0,250}currentUserAvatarUrl: hasSessionAuth \? accountAvatarUrl : ""/,
  "The Skills overview must receive the signed-in creator identity.",
);

assert.match(
  skillRenderingSource,
  /function renderSkillsOverviewPage\(\)\s*\{[\s\S]{0,300}createPortal\(renderSkillsCreateAction\(\), topNavActionsContainer\)[\s\S]{0,2400}skillsTopNavActions,[\s\S]{0,180}React\.createElement\(SkillsOverviewPage/,
  "The Skills overview must mount its Custom Skill primary action in the app header.",
);
assert.match(
  skillRenderingSource,
  /isComputerAgents: systemSkillFamilyId === "computer_agents"[\s\S]{0,400}creatorName: String\([\s\S]{0,260}currentUserName \|\| currentUserEmail \|\| "You"[\s\S]{0,500}creatorAvatarUrl: String\([\s\S]{0,260}currentUserAvatarUrl/,
  "The Skills overview must distinguish the Computer Agents icon and render custom creator provenance.",
);
assert.match(
  skillStateSource,
  /const creatorName = isSystemSkill[\s\S]{0,500}"Computer Agents"[\s\S]{0,500}currentUserName \|\| currentUserEmail[\s\S]{0,500}const creatorAvatarUrl = isSystemSkill[\s\S]{0,500}currentUserAvatarUrl/,
  "Custom Skills must retain their creator identity instead of inheriting the system creator.",
);
const createCustomSkillDraftSource = skillActionsSource.match(
  /function createAndOpenCustomSkill\(\)[\s\S]*?(?=\n\s*function handleSkillSelect)/,
)?.[0] || "";
assert.match(
  createCustomSkillDraftSource,
  /PLAYGROUND_CUSTOM_SKILL_DRAFT_ID[\s\S]*?isDraft: true[\s\S]*?setSkillsPageMode\("detail"\)/,
  "Creating a custom Skill must immediately open an unpersisted detail-page draft.",
);
assert.doesNotMatch(
  createCustomSkillDraftSource,
  /\bfetch\(/,
  "Opening a new custom Skill must not persist it before the first Save.",
);
const persistCustomSkillDraftSource = skillActionsSource.match(
  /if \(selectedSkill\.isDraft\) \{[\s\S]*?(?=\n\s*if \(activeFile)/,
)?.[0] || "";
assert.match(
  persistCustomSkillDraftSource,
  /\/skills"[\s\S]*?method: "POST"[\s\S]*?setSelectedSkillId\(createdSkill\.id\)/,
  "The first Save must create the draft Skill and continue on its persisted detail page.",
);
assert.doesNotMatch(
  persistCustomSkillDraftSource,
  /\/versions/,
  "The first Save must not create a redundant second Skill version.",
);
assert.match(
  skillStateSource,
  /const localDraft = current\.find\([\s\S]{0,240}PLAYGROUND_CUSTOM_SKILL_DRAFT_ID[\s\S]{0,240}\[localDraft, \.\.\.normalizedSkills/,
  "An in-flight Skills fetch must not discard an open local draft.",
);
assert.match(
  skillRenderingSource,
  /const skillVersionControlDisabled = Boolean\([\s\S]{0,180}skillVersionControlBusy[\s\S]{0,100}!skillHasVersionChanges[\s\S]{0,500}disabled: skillVersionControlDisabled,[\s\S]{0,100}menuDisabled: skillVersionControlDisabled/,
  "Skill Save Changes and its chevron must always share one disabled state.",
);
assert.match(
  skillStateSource,
  /useEffect\(\(\) => \{[\s\S]{0,240}skillsPageMode !== "detail"[\s\S]{0,180}!selectedSkill\?\.isDraft[\s\S]{0,240}skillTitleInputRef\.current\.focus\(\{ preventScroll: true \}\)/,
  "Opening a new Skill detail page must focus its title input.",
);
assert.match(
  skillDetailIdentityAndSettingsSource,
  /ref: skillTitleInputRef,[\s\S]{0,120}className: "skill-detail-page__name-input"/,
  "The Skill title input must expose the focus ref used by the draft-entry lifecycle.",
);
assert.match(
  skillRenderingSource,
  /label: skillSaveState\.isSaving \? "Saving\.\.\." : "Save Changes"[\s\S]{0,180}leading: React\.createElement\(Bookmark/,
  "Skills must use the standard Save Changes label and icon.",
);
assert.match(
  skillRenderingSource,
  /onPublish: \(\) => openSkillVersionSaveDialog\(\)/,
  "The Skill Save Changes action must open the shared version review flow.",
);
assert.match(
  skillDetailIdentityAndSettingsSource,
  /React\.createElement\(ProjectIconPicker,[\s\S]{0,500}iconOptions: PLAYGROUND_SKILL_ICON_OPTIONS[\s\S]{0,350}onChange: handleSelectedSkillIdentityChange/,
  "Skill Details must reuse the centralized Project icon picker for Skill identity.",
);
assert.match(
  skillDetailIdentityAndSettingsSource,
  /React\.createElement\(PlatformDeploymentMap,[\s\S]{0,300}title: "Deployment region"[\s\S]{0,500}accessSettings/,
  "Skill Settings must place the shared deployment region section before access settings.",
);
assert.match(
  skillDetailIdentityAndSettingsSource,
  /renderSkillDetailSidebarRow\("Creator"[\s\S]{0,900}renderSkillDetailSidebarRow\("Owner"/,
  "Skill Settings must expose creator and owner identities in its properties sidebar.",
);
assert.match(
  skillRenderingSource,
  /const skillSettingsComposition = renderSkillSettingsComposition\([\s\S]{0,300}const skillSettingsSidebar = skillSettingsComposition\.sidebar[\s\S]{0,4000}sidebar: skillSettingsSidebar/,
  "Skill Details must pass the shared settings properties sidebar into its detail shell.",
);
assert.match(
  skillVersioningSource,
  /function renderSkillVersionSaveDialog\(\)[\s\S]{0,900}React\.createElement\(PlatformVersionSaveDialog,[\s\S]{0,1400}React\.createElement\(PlatformDiffViewer/,
  "Skills must review source changes in the centralized version-save dialog.",
);
assert.match(
  skillVersioningSource,
  /function handleSkillVersionKeyboardShortcut\(event\)[\s\S]{0,500}String\(event\.key \|\| ""\)\.toLowerCase\(\) !== "s"[\s\S]{0,700}openSkillVersionSaveDialog/,
  "Command+S on Skill details must open the version-save dialog.",
);
assert.match(
  skillActionsSource,
  /saveToCurrentVersion[\s\S]{0,1800}method: saveToCurrentVersion \? "PATCH" : "POST"[\s\S]{0,500}operation: "publish"[\s\S]{0,300}publish: true/,
  "Skills must support saving into the current version or creating a new version.",
);
assert.match(
  skillActionsSource,
  /saveSelectedSkillCodeFiles\(nextFiles, \{ throwOnError: true \}\)/,
  "Skill version publishing must request source-save error propagation.",
);
assert.match(
  skillActionsSource,
  /async function saveSelectedSkillCodeFiles\(nextCodeFiles, options = \{\}\)[\s\S]*?options\.throwOnError[\s\S]{0,120}throw error/,
  "Skill version publishing must preserve the underlying source-save failure.",
);
assert.match(
  shellSettingsToolsSource,
  /label: toolsSkillsHeaderState\.title \|\| "Skill"[\s\S]{0,400}id: "playground-skill-title-actions"/,
  "Skill details must expose the title-actions portal beside the Skill title.",
);
assert.match(
  shellSettingsToolsSource,
  /titleActionsPortalId: "playground-skill-title-actions"/,
  "The Skills controller must receive the title-actions portal.",
);
assert.match(
  shellSettingsToolsSource,
  /versionsDrawerPortalId: "playground-agent-versions-drawer-root",[\s\S]{0,120}onVersionsSidebarOpenChange: setIsAgentVersionsDetailOpen/,
  "Skill versions must use the shell-owned responsive versions drawer.",
);
assert.match(
  shellApplicationLifecycleSource,
  /hasSkillsVersionsDrawerSlot = activePage === "tools" && toolsView === "skills"[\s\S]{0,1800}hasSkillsVersionsDrawerSlot[\s\S]{0,120}isAgentVersionsDetailOpen/,
  "The shell must reserve content width while the Skill versions drawer is open.",
);
for (const expectedSkillTitleAction of [
  '"aria-label": "Skill actions"',
  '["ID"',
  '["Created"',
  '["Updated"',
  '"Send to Team"',
  '"Copy Skill"',
  '"Delete"',
]) {
  assert.ok(
    skillTitleActionsSource.includes(expectedSkillTitleAction),
    `Skill title actions must include ${expectedSkillTitleAction}.`,
  );
}
assert.match(
  skillTitleActionsSource,
  /function renderSkillTitleActions\(\)[\s\S]*?titleActionsContainer/,
  "Skill details must provide the same compact metadata and actions menu as Agent details.",
);
assert.match(
  skillTitleActionsSource,
  /resourceType: "skill"[\s\S]{0,1600}patchSelectedSkillFields\(\{ metadata: nextMetadata \}\)/,
  "Sending a Skill to a team must persist both the team share and Skill access metadata.",
);
assert.match(
  skillRenderingSource,
  /className: "skill-detail-page__access-table",[\s\S]{0,100}title: "Manage Skill Access"/,
  "Skill settings must label the centralized access table.",
);
assert.match(
  skillRenderingSource,
  /className: "skill-detail-page__versions-sidebar",[\s\S]{0,120}width: "var\(--playground-thread-task-detail-width, min\(42vw, 520px\)\)"/,
  "Skill version history must retain the Agent sidebar width when portaled outside the content shell.",
);
const skillVersionSidebarSource = skillRenderingSource.match(
  /const skillVersionsSidebar =[\s\S]*?(?=\n\s*return React\.createElement\(React\.Fragment)/,
)?.[0] || "";
assert.doesNotMatch(
  skillVersionSidebarSource,
  /onCreateVersion/,
  "Skill version history must not render a redundant Version button in its header.",
);
for (const expectedSkillVersionSidebarControl of [
  "onPublishVersion:",
  "canPublishVersion:",
  "onViewChanges:",
  "getVersionActions:",
]) {
  assert.ok(
    skillVersionSidebarSource.includes(expectedSkillVersionSidebarControl),
    `Skill version history must wire ${expectedSkillVersionSidebarControl}.`,
  );
}
for (const expectedSkillVersionAction of [
  'label: "Edit description"',
  'label: "View Changes"',
  'label: "Delete version"',
  "icon: SquarePen",
  "icon: Code2",
  "icon: Trash2",
]) {
  assert.ok(
    skillVersioningSource.includes(expectedSkillVersionAction),
    `Skill version actions must include ${expectedSkillVersionAction}.`,
  );
}
assert.match(
  skillVersioningSource,
  /function renderSkillVersionChangesPage\(actions = null\)[\s\S]*?renderPlaygroundVersionChangesPage\(\{[\s\S]*?className: "playground-skills-version-changes-page"/,
  "Skill versions must expose the shared source-comparison screen.",
);
assert.match(
  skillVersioningSource,
  /function getDefaultSkillVersionCompareSourceIds\(versionId = ""\)[\s\S]{0,2600}previousSource[\s\S]{0,900}editorHasChanges/,
  "Skill version comparisons must fall back to adjacent saved versions when the editor is unchanged.",
);
assert.match(
  skillVersioningSource,
  /function openSkillVersionChangesPage\(versionId\)[\s\S]{0,300}getDefaultSkillVersionCompareSourceIds\(versionId\)[\s\S]{0,200}setSkillVersionChangesState\(compareSourceIds\)/,
  "Opening Skill changes must use the meaningful default comparison pair.",
);
assert.match(
  skillRenderingSource,
  /portalTarget: skillVersionsDrawerContainer/,
  "The Skill version sidebar must mount in the shell drawer instead of covering the changes page.",
);
assert.match(
  skillVersioningSource,
  /onVersionsSidebarOpenChange\(Boolean\(skillVersionsOpen\)\)/,
  "The Skill controller must notify the shell when its version sidebar opens.",
);
assert.match(
  skillVersioningSource,
  /function renderSkillVersionEditDialog\(\)[\s\S]*?title: "Edit " \+ versionLabel[\s\S]*?initialFocusRef: skillVersionDescriptionTextareaRef/,
  "Editing a Skill version description must open a focused version modal.",
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
  /React\.createElement\(PlatformUiCard, \{[\s\S]{0,180}variant: "sidebar",[\s\S]{0,220}className: "playground-ticket-detail-sidebar-section playground-ticket-detail-sidebar-details playground-agents-detail-about-card"/,
  "The Agent details sidebar must reuse the centralized Ticket details card.",
);
assert.match(
  agentDialogsSource,
  /className: "playground-tasks-detail-facts is-centralized-sidebar-content playground-agent-detail-sidebar-facts"/,
  "The Agent details sidebar must reuse the centralized Ticket facts layout.",
);
assert.match(
  agentDialogsSource,
  /const agentUsageChartSection = React\.createElement\(PlatformAnalyticsSection, \{[\s\S]{0,180}variant: "default",[\s\S]{0,180}analytics: agentDetailAnalyticsModel/,
  "The Agent Insights analytics section must use the standard unboxed variant.",
);
const agentUsageChartSectionStart = agentDialogsSource.indexOf(
  "const agentUsageChartSection =",
);
const agentUsageChartSectionEnd = agentDialogsSource.indexOf(
  "const normalizedAgentDetailActionId =",
  agentUsageChartSectionStart,
);
assert.ok(
  agentUsageChartSectionStart >= 0 && agentUsageChartSectionEnd > agentUsageChartSectionStart,
  "The Agent Insights analytics section source must be present.",
);
assert.doesNotMatch(
  agentDialogsSource.slice(agentUsageChartSectionStart, agentUsageChartSectionEnd),
  /timeframe:/,
  "The Agent Insights timeframe selector must not remain inside the analytics content.",
);
assert.match(
  agentBootstrapSource,
  /showTimeframe: !agentVersionChangesState[\s\S]{0,180}\["insights", "threads", "evaluation"\]\.includes\(agentDetailTab\)[\s\S]{0,260}timeframeValue: normalizedAgentDetailPerformanceRange/,
  "The Agent controller must publish the Insights timeframe state to the app header.",
);
const agentTimeframeOptionsDeclarationIndex = agentBootstrapSource.indexOf(
  "const agentDetailPerformanceRangeOptions =",
);
const agentTimeframeHeaderPublicationIndex = agentBootstrapSource.indexOf(
  "showTimeframe: !agentVersionChangesState",
);
assert.ok(
  agentTimeframeOptionsDeclarationIndex >= 0
    && agentTimeframeHeaderPublicationIndex > agentTimeframeOptionsDeclarationIndex,
  "The Agent timeframe model must be initialized before the app-header lifecycle reads it.",
);
const agentHeaderCenterSource = shellCompositionSource.match(
  /center: isResourcesDetailView && activeResourcesView === "agents"[\s\S]*?(?=\n\s*: isDatabaseResourcesDetailView)/,
)?.[0] || "";
assert.match(
  agentHeaderCenterSource,
  /className: "playground-agent-detail-header-center"/,
  "The Agent app header must compose its centered controls in one layout.",
);
assert.doesNotMatch(
  agentHeaderCenterSource,
  /playground-agent-detail-header-timeframe|Agent analytics time frame/,
  "The Agent Insights timeframe selector must not remain in the centered app-header controls.",
);
assert.match(
  shellCompositionSource,
  /extraActions: React\.createElement\(React\.Fragment, null,[\s\S]{0,300}activeResourcesView === "agents"[\s\S]{0,180}resourcesHeaderState\.activeSection === "insights"[\s\S]{0,180}resourcesHeaderState\.showTimeframe[\s\S]{0,300}className: "playground-agent-detail-header-timeframe"[\s\S]{0,700}ariaLabel: "Agent analytics time frame"/,
  "Only Agent Insights must render its timeframe selector in the right app-header actions.",
);
assert.match(
  shellApplicationLifecycleSource,
  /const isAgentDetailsShellActive = Boolean\([\s\S]{0,300}activeResourcesView === "agents"[\s\S]{0,220}resourcesHeaderState\.mode === "detail"[\s\S]{0,500}enteredAgentDetails[\s\S]{0,220}setSidebarOpen\(false\)/,
  "Entering Agent Details must collapse the global left sidebar once without preventing a later manual reopen.",
);
assert.match(
  agentHeaderCenterSource,
  /!isResourcesDetailView && activeResourcesView === "agents"[\s\S]{0,240}id: "playground-agents-overview-period-controls"/,
  "The Agent overview must expose a dedicated centered app-header portal for its timeframe selector.",
);
assert.match(
  agentHeaderCenterSource,
  /!isResourcesDetailView && activeResourcesView === "computers"[\s\S]{0,240}id: "playground-computers-overview-period-controls"/,
  "The Computers overview must expose a dedicated centered app-header portal for its timeframe selector.",
);
assert.match(
  agentHeaderCenterSource,
  /!isResourcesDetailView[\s\S]{0,120}activeResourcesView === "servers"[\s\S]{0,220}\["web_app", "function", "database", "auth", "secrets", "payments"\]\.includes\(activeResourcesServerKind\)[\s\S]{0,180}id: "playground-develop-resource-overview-period-controls"/,
  "Develop resource overviews must expose a dedicated centered app-header portal for their timeframe selector.",
);
assert.match(
  shellCompositionSource,
  /isComputerResourcesDetailView[\s\S]{0,300}React\.createElement\(PlatformSwitch,[\s\S]{0,500}\{ value: "general", label: "General" \},[\s\S]{0,180}\{ value: "runtime", label: "Runtime" \},[\s\S]{0,180}\{ value: "settings", label: "Settings" \}/,
  "Computer Details must use the centralized General, Runtime, and Settings app-header switch.",
);
assert.match(
  shellCompositionSource,
  /activeResourcesView === "computers"[\s\S]{0,180}id: "playground-computer-title-actions"/,
  "Computer Details must expose a breadcrumb-adjacent resource-actions portal.",
);
assert.match(
  shellCompositionSource,
  /computerTitleActionsPortalId: "playground-computer-title-actions"/,
  "The Compute Resources page must receive the Computer title-actions portal ID.",
);
assert.doesNotMatch(
  agentDialogsSource,
  /renderAgentFactRow\(\s*"Email"/,
  "The Agent details sidebar must not duplicate the email shown below the content title.",
);
assert.match(
  agentDialogsSource,
  /className: "playground-agents-profile-email",\s*title: agentEmailAddress,[\s\S]{0,80}\}, agentEmailAddress\)/,
  "The Agent content identity must render the live email directly below the editable title.",
);
assert.match(
  platformTemplateSource,
  /PLAYGROUND_SPARK_AGENT_ACTIVE_PROFILE_URL = "\/img\/agent-profile-pics\/exp-spark\.gif"/,
  "The Agent identity must resolve the optimized active Spark avatar without affecting other profile images.",
);
assert.match(
  platformTemplateSource,
  /function getPlaygroundAgentProfileHoverPhotoUrl\(photoUrl\)[\s\S]{0,500}PLAYGROUND_SPARK_AGENT_ACTIVE_PROFILE_URL/,
  "Only a recognized Spark profile image may opt into the active hover asset.",
);
assert.match(
  agentDialogsSource,
  /React\.createElement\(PlatformProfileImagePicker, \{\s*value: agentProfilePhotoUrl,\s*hoverValue: agentProfileHoverPhotoUrl/,
  "Agent Details must lazily animate the Spark profile image while it is hovered.",
);
assert.match(
  agentDialogsSource,
  /className: "playground-content-title playground-tasks-detail-navbar-title-input playground-environments-editor-title-input playground-agents-profile-name-input",[\s\S]{0,420}disabled: isDefaultAgentConfigurationLocked/,
  "Default Agent names must remain visible but locked in the content identity block.",
);
assert.match(
  agentDialogsSource,
  /React\.createElement\(PlatformButtonSelector, \{[\s\S]{0,220}mode: "split-action",[\s\S]{0,120}buttonVariant: "primary",[\s\S]{0,220}label: "Start a Thread",[\s\S]{0,400}popupVariant: "minimal",[\s\S]{0,400}matchTriggerWidth: true,[\s\S]{0,1200}onAction: handleAgentProfileNewThread/,
  "The Agent details sidebar must use the centralized primary split-action control to start a thread.",
);
for (const itemLabel of ["Share with a Team", "Use via API", "Copy Agent"]) {
  assert.match(
    agentDialogsSource,
    new RegExp(`const agentThreadActionControl =[\\s\\S]{0,3200}"${itemLabel}"`),
    `The Agent details split action must include ${itemLabel}.`,
  );
}
assert.match(
  agentDialogsSource,
  /const agentThreadActionControl =[\s\S]{0,2200}openAgentSendToTeamModal\(draftAgent\)[\s\S]{0,1200}openAgentApiModal[\s\S]{0,1200}openCurrentAgentCopyModal/,
  "The Agent details split-action menu must reuse the existing share, API, and copy flows.",
);
assert.match(
  agentMutationsSource,
  /function handleAgentProfileNewThread\(\)[\s\S]{0,500}onStartThreadWithAgent\(normalizedAgentId\)/,
  "Starting a thread from Agent details must pass the selected Agent to the shell.",
);
assert.match(
  shellCompositionSource,
  /onStartThreadWithAgent: \(agentId\) => \{[\s\S]{0,500}setPreferredAgentId\(normalizedAgentId\)[\s\S]{0,300}handleNewThread\(\)/,
  "The Agent detail thread action must open New Thread with that Agent preselected.",
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
  /Agent analytics time frame|agentInsightsTimeframeControl/,
  "The Agent timeframe selector must not remain in the right app-header actions.",
);
assert.doesNotMatch(
  agentTopNavActionsSource,
  /Ellipsis|Agent actions/,
  "The Agent app-header action area must not retain the old ellipsis menu.",
);
assert.match(
  shellCompositionSource,
  /resourcesDetailVersionLabel[\s\S]{0,2200}id: "playground-agent-title-actions"/,
  "The Agent action target must render beside the resource title and version label.",
);
assert.match(
  shellCompositionSource,
  /titleActionsPortalId: "playground-agent-title-actions"/,
  "The Agent detail controller must receive the title action portal target.",
);
assert.match(
  shellCompositionSource,
  /isDatabaseResourcesDetailView[\s\S]{0,2600}id: "playground-database-title-actions"/,
  "The Database action target must render beside the database title.",
);
assert.match(
  shellCompositionSource,
  /databaseTitleActionsPortalId: "playground-database-title-actions"/,
  "The Database detail controller must receive the title action portal target.",
);
assert.match(
  shellCompositionSource,
  /isManagedServerResourcesDetailView[\s\S]{0,3000}id: "playground-server-title-actions"/,
  "The shared managed-server action target must render beside every managed server title.",
);
assert.match(
  shellCompositionSource,
  /serverTitleActionsPortalId: "playground-server-title-actions"/,
  "The shared managed-server detail controller must receive the title action portal target.",
);
assert.match(
  shellCompositionSource,
  /isAuthenticationResourcesDetailView[\s\S]{0,300}React\.createElement\(PlatformSwitch,[\s\S]{0,500}\{ value: "users", label: "Users" \},[\s\S]{0,180}\{ value: "usage", label: "Usage" \},[\s\S]{0,180}\{ value: "settings", label: "Settings" \}/,
  "Authentication details must use the centralized Users, Usage, and Settings app-header switch.",
);
assert.match(
  shellCompositionSource,
  /isAgentRuntimeResourcesDetailView[\s\S]{0,300}React\.createElement\(PlatformSwitch,[\s\S]{0,500}\{ value: "usage", label: "Usage" \},[\s\S]{0,180}\{ value: "threads", label: "Threads" \},[\s\S]{0,180}\{ value: "settings", label: "Settings" \}/,
  "Agent Runtime details must use the centralized Usage, Threads, and Settings app-header switch.",
);
assert.match(
  shellCompositionSource,
  /isSecretsResourcesDetailView[\s\S]{0,300}React\.createElement\(PlatformSwitch,[\s\S]{0,500}\{ value: "secrets", label: "Secrets" \},[\s\S]{0,180}\{ value: "usage", label: "Usage" \},[\s\S]{0,180}\{ value: "settings", label: "Settings" \}/,
  "Secrets details must use the centralized Secrets, Usage, and Settings app-header switch.",
);
assert.match(
  shellCompositionSource,
  /isPaymentsResourcesDetailView[\s\S]{0,300}React\.createElement\(PlatformSwitch,[\s\S]{0,500}\{ value: "usage", label: "Usage" \},[\s\S]{0,180}\{ value: "settings", label: "Settings" \}/,
  "Payments details must use the centralized Usage and Settings app-header switch.",
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
  /renderAgentFactRow\(\s*"Owner",\s*renderAgentOwnerRow\(\{ compact: true, alignment: "end" \}\),[\s\S]{0,220}className: "is-assignee playground-agents-detail-about-owner-row"[\s\S]{0,160}valueClassName: "playground-agents-detail-about-owner-control"/,
  "The Agent details card must render the owner selector as its final divided property row.",
);
assert.match(
  agentDialogsSource,
  /const instructionsSection = React\.createElement\(PlatformInstructionsEditor, \{[\s\S]{0,700}variant: "minimalistic-ui",[\s\S]{0,120}className: "playground-agent-detail-instructions-editor"/,
  "The Agent details instructions editor must use the centralized minimalistic UI variant.",
);
assert.match(
  agentDialogsSource,
  /const instructionsSection = React\.createElement\(PlatformInstructionsEditor, \{[\s\S]{0,220}title: "Instructions"/,
  "The General editor must expose its own Instructions title.",
);
assert.match(
  agentDialogsSource,
  /const agentGeneralSection = React\.createElement\("section", \{[\s\S]{0,220}agentProfileSection,[\s\S]{0,80}instructionsSection,[\s\S]{0,80}agentGeneralRuntimeSettings/,
  "The General tab must place the editable Agent identity above Instructions and runtime settings.",
);
assert.match(
  agentDialogsSource,
  /const agentGeneralRuntimeSettings = React\.createElement\("div", \{[\s\S]{0,900}renderAgentFactRow\(\s*"Model"[\s\S]{0,900}renderAgentFactRow\(\s*"Engine"[\s\S]{0,900}renderAgentFactRow\(\s*"Voice"/,
  "The General tab must keep Model, Engine, and Voice together below Instructions.",
);
assert.match(
  agentDialogsSource,
  /sidebar: normalizedAgentDetailTab === "general" \? null : agentPropertiesSidebar/,
  "The General tab must suppress the legacy details sidebar.",
);
const agentPreviewSource = agentAssistantSource.match(
  /function renderAgentPreviewPanel\(\)[\s\S]*?(?=\n\s+function renderAgentVersionsSidebar)/,
)?.[0] || "";
assert.match(
  agentPreviewSource,
  /React\.createElement\(RunnerChat, \{[\s\S]*?resolveRequestHeaders,[\s\S]*?agentId: previewAgentId,[\s\S]*?privateMode: true/,
  "The Agent preview must reuse RunnerChat with the selected Agent in private mode.",
);
assert.match(
  agentPreviewSource,
  /const isPreviewTeamAgent = Boolean\([\s\S]{0,180}isPlaygroundTeamAgent\(draftAgent\)/,
  "The Agent preview must derive its team state inside the preview renderer.",
);
assert.doesNotMatch(
  agentPreviewSource,
  /\bisTeamAgent\b/,
  "The Agent preview must not reference editor-local team state.",
);
assert.match(
  agentPreviewSource,
  /threadMetadata: \{[\s\S]{0,300}source: "agent-detail-preview",[\s\S]{0,180}temporary: true/,
  "The Agent preview thread must be explicitly marked as temporary private activity.",
);
assert.match(
  agentPreviewSource,
  /const previewServiceActions = \[[\s\S]*?label: "Evaluate the Agent"[\s\S]*?label: "Fine-tune the Agent"[\s\S]*?label: "Refine Instructions"/,
  "The empty Agent preview must use the centralized UI card for evaluation, optimization, and instruction-refinement entry points.",
);
assert.match(
  agentPreviewSource,
  /label: "Refine Instructions"[\s\S]{0,300}setAgentPreviewRefineMode\(true\)[\s\S]{0,220}setAgentPreviewComposerFocusRequest/,
  "The Agent preview guide must activate refinement and explicitly request composer focus.",
);
assert.match(
  agentPreviewSource,
  /composerFocusRequest: agentPreviewComposerFocusRequest/,
  "The Agent preview must forward card-triggered focus requests to the centralized task input.",
);
assert.doesNotMatch(
  agentPreviewSource,
  /label: "Explore Guardrails"/,
  "The Agent preview guide must replace its Guardrails shortcut with instruction refinement.",
);
assert.match(
  agentPreviewSource,
  /React\.createElement\(PlatformUiCard, \{[\s\S]{0,220}variant: "feature"[\s\S]{0,160}className: "playground-agent-preview-guide-card"/,
  "The Agent preview guide must render with the centralized feature-card component.",
);
assert.match(
  agentPreviewSource,
  /const isDefaultPreviewAgent = isPlaygroundDefaultAgentConfigurationLocked\(draftAgent\);/,
  "The Agent preview must identify protected default Agents with the canonical helper.",
);
assert.match(
  agentPreviewSource,
  /const previewEmptyState = isDefaultPreviewAgent\s*\?[\s\S]{0,180}is-default-agent/,
  "Default Agents must use a blank preview empty state instead of the improvement guide card.",
);
assert.match(
  agentPreviewSource,
  /const previewRefineControl = canRefinePreviewAgent[\s\S]{0,300}playground-agent-preview-refine-control/,
  "Only versionable custom Agents may render the Refine composer control.",
);
assert.match(
  agentPreviewSource,
  /React\.createElement\(TestTubeDiagonal,[\s\S]{0,160}"aria-hidden": "true"/,
  "Custom Agent previews must expose the TestTubeDiagonal refinement icon control.",
);
assert.doesNotMatch(
  agentPreviewSource,
  /React\.createElement\("span", null, "Refine"\)/,
  "The Agent preview refinement control must remain an icon-only round control.",
);
assert.match(
  agentPreviewSource,
  /composerBeforeAgentControl: previewRefineControl/,
  "The Refine control must render immediately after the thread-context ring.",
);
assert.match(
  agentPreviewSource,
  /threadViewMode: "legacy"/,
  "The Agent preview must use the exact working-log renderer selected by the normal thread-details page.",
);
assert.match(
  agentPreviewSource,
  /hiddenSystemPrompt: agentPreviewRefineMode[\s\S]{0,140}buildAgentPreviewRefinementHiddenPrompt\(draftAgent\)/,
  "Active refinement mode must provide the dedicated instruction-refinement execution prompt.",
);
assert.match(
  agentPreviewSource,
  /enabledSkillIds: agentPreviewRefineMode[\s\S]{0,260}"computer_agents"/,
  "Active refinement mode must enable the Computer Agents skill for the immutable version mutation.",
);
assert.match(
  agentBootstrapSource,
  /function buildAgentPreviewRefinementHiddenPrompt[\s\S]{0,2400}agents versions [\s\S]{0,300}create --label \\"Refined Instructions\\"[\s\S]{0,300}--status published[\s\S]{0,300}Do not use `agents update`/,
  "Instruction refinement must require a newly published immutable Agent version instead of a mutable update.",
);
assert.match(
  agentBootstrapSource,
  /agentPreviewRefinementRun\?\.status !== "running"[\s\S]{0,700}loadAgentDetails\(refinementAgentId,[\s\S]{0,240}window\.setTimeout\(refreshRefinedAgent, 1000\)/,
  "A running refinement must synchronize authoritative Agent instructions into the details editor in real time.",
);
assert.match(
  agentPreviewSource,
  /refreshedInstructions !== baselineInstructions[\s\S]{0,600}createAgentVersionApi\(previewAgentId,[\s\S]{0,500}publishAgentVersionApi\(previewAgentId/,
  "The refinement completion path must enforce a versioned fallback if a worker performed only a mutable instruction update.",
);
assert.match(
  agentPreviewSource,
  /React\.createElement\("aside", \{[\s\S]{0,180}className: "playground-agent-preview-sidebar"/,
  "The private Agent preview must render in its dedicated sidebar.",
);
assert.doesNotMatch(
  agentPreviewSource,
  /PlaygroundOnboardingVideoBackground|agentPreviewEmpty|onEmptyStateChange/,
  "The private Agent preview must not mount an onboarding video or alter its surface for the empty state.",
);
assert.match(
  shellCompositionSource,
  /onOpenEvaluations: openEvaluationsOverviewPage,[\s\S]{0,160}onOpenAgentOptimization: openFineTuningOverviewPage/,
  "Agent preview service actions must use the canonical Configure navigation functions for evaluation and optimization.",
);
assert.doesNotMatch(
  agentPreviewSource,
  /onThreadRegistered|rememberAgentAssistantThread/,
  "Temporary Agent previews must never register themselves in the Create-mode thread rail.",
);
assert.match(
  agentDialogsSource,
  /const agentDetailLayoutClass = "playground-agents-detail-layout"[\s\S]{0,240}agentVersionsSidebarOpen \? " has-version-history" : ""/,
  "The Agent detail layout must expose the Version History state independently from the preview state.",
);
assert.match(
  platformTemplateCss,
  /\.playground-agents-detail-layout:is\(\.has-preview, \.has-version-history\) > \.playground-agents-detail-main-pane > \.playground-environments-detail-scroll\.playground-settings-detail-scroll\s*\{[\s\S]{0,100}padding-bottom:\s*0;/,
  "The Agent General workspace must not reserve page padding below its runtime settings with either side panel visible.",
);
assert.match(
  platformTemplateCss,
  /\.playground-agents-detail-layout:is\(\.has-preview, \.has-version-history\) \.playground-agents-detail-overview-main,[\s\S]{0,180}\.playground-agents-detail-layout:is\(\.has-preview, \.has-version-history\) \.playground-agent-general-section\s*\{[\s\S]{0,100}height:\s*100%;/,
  "The Agent General content height chain must anchor runtime settings to the screen bottom with Preview or Version History open.",
);
assert.match(
  platformTemplateCss,
  /\.playground-agent-general-section > \.playground-agent-detail-editor-profile\s*\{[\s\S]{0,100}padding:\s*0 0 24px;[\s\S]{0,120}border-bottom:\s*1px solid rgba\(255, 255, 255, 0\.1\);[\s\S]{0,80}margin-bottom:\s*12px;/,
  "The Agent General profile must keep its requested divider and vertical spacing.",
);
assert.doesNotMatch(
  platformTemplateCss,
  /\.playground-agent-general-runtime-settings\s*\{[^}]*border-bottom:/,
  "The Agent General Voice row must not end with a bottom divider.",
);
assert.match(
  platformTemplateCss,
  /\.tb-runner-chat\.playground-agent-preview-runner \.task-input-box,[\s\S]{0,120}\.task-input-box-private\s*\{[\s\S]{0,180}--tb-task-input-outline:\s*transparent;[\s\S]{0,180}--tb-task-input-base-bg:\s*rgba\(30, 30, 30, 0\.9\);/,
  "The private Agent preview composer must use its dark home surface without a private outline.",
);
assert.doesNotMatch(
  platformTemplateCss,
  /\.playground-agent-preview-sidebar\.is-empty[\s\S]{0,240}--tb-task-input-base-bg:\s*transparent;/,
  "The private Agent preview composer must retain its dark surface in the empty state.",
);
assert.match(
  platformTemplateCss,
  /\.playground-agent-preview-guide-card\.platform-ui-card\.is-feature\s*\{[\s\S]{0,300}backdrop-filter:\s*blur\(20px\);/,
  "The Agent preview guide card must blur its underlying sidebar surface by twenty pixels.",
);
assert.match(
  platformTemplateCss,
  /\.playground-agent-preview-refine-control\.is-active,[\s\S]{0,120}\.playground-agent-preview-refine-control\.is-active:hover\s*\{[\s\S]{0,180}color:\s*#4da3ff;[\s\S]{0,100}background:\s*transparent;[\s\S]{0,100}border-color:\s*transparent;/,
  "Only the icon of the active Refine composer control may use the light-blue treatment.",
);
assert.match(
  platformTemplateCss,
  /\.playground-agent-preview-refine-control\s*\{[\s\S]{0,180}width:\s*var\(--tb-runner-control-size, 32px\);[\s\S]{0,120}height:\s*var\(--tb-runner-control-size, 32px\);[\s\S]{0,180}border-radius:\s*999px;/,
  "The Agent preview refinement control must use the same round icon-button geometry as the composer controls.",
);
assert.match(
  platformTemplateCss,
  /\.tb-runner-chat\.playground-agent-preview-runner[\s\S]{0,180}\.tb-composer-leading-control:has\(> \.playground-agent-preview-refine-control\)\s*\{[\s\S]{0,80}margin-left:\s*-12px;/,
  "The Agent preview refinement control must cancel the extra composer gap to its left.",
);
assert.match(
  platformTemplateCss,
  /\.playground-agents-model-picker-card\s*\{[\s\S]{0,520}background:\s*rgba\(255, 255, 255, 0\.05\);/,
  "Agent model-picker cards must use the white-five surface.",
);
assert.match(
  platformTemplateCss,
  /\.playground-agents-detail-assistant-page \.playground-agents-detail-layout\.has-preview \.playground-agents-detail-main-pane \.playground-agents-detail-content\s*\{[\s\S]{0,80}padding-top:\s*24px;/,
  "Only the Agent General preview layout must use twenty-four pixels of content top padding.",
);
assert.match(
  platformTemplateCss,
  /\.playground-agents-page \.playground-agents-detail-main-pane \.playground-environments-detail-scroll,[\s\S]{0,180}\.playground-environments-detail-scroll\.playground-settings-detail-scroll\s*\{[\s\S]{0,80}padding:\s*0 24px 56px;/,
  "Agent detail scroll surfaces must use twenty-four pixels of horizontal padding.",
);
assert.match(
  platformTemplateCss,
  /\.playground-agent-preview-sidebar\s*\{[\s\S]{0,260}background:\s*#000;/,
  "The private Agent preview sidebar must use a solid-black surface.",
);
assert.doesNotMatch(
  agentDialogsSource,
  /header: agentProfileSection|sidebarToggle: agentDetailSidebarToggle/,
  "The Agent detail body must not duplicate its identity or sidebar toggle above the content.",
);
assert.match(
  agentBootstrapSource,
  /activeSection: activeHeaderSection,[\s\S]{0,520}onSectionChange: \(nextSection\)/,
  "The Agent detail controller must publish its active section to the app header.",
);
assert.match(
  shellCompositionSource,
  /className: "playground-agent-detail-header-switch"[\s\S]{0,500}\{ value: "general", label: "General" \}[\s\S]{0,120}\{ value: "insights", label: "Insights" \}[\s\S]{0,120}\{ value: "settings", label: "Settings" \}/,
  "Agent detail navigation must use the centralized app-header switch.",
);
assert.match(
  shellCompositionSource,
  /const isDatabaseResourcesDetailView =[\s\S]{0,220}resourcesHeaderState\.resourceType === "database"/,
  "The app header must identify Database detail routes.",
);
assert.match(
  shellCompositionSource,
  /className: "playground-database-detail-header-switch"[\s\S]{0,500}\{ value: "data", label: "Data" \}[\s\S]{0,120}\{ value: "usage", label: "Usage" \}[\s\S]{0,120}\{ value: "settings", label: "Settings" \}/,
  "Database detail navigation must use the centralized app-header switch.",
);
assert.match(
  shellCompositionSource,
  /const isSourceDeployableResourcesDetailView =[\s\S]{0,240}\["function", "web_app"\]\.includes\(activeResourcesServerKind\)[\s\S]{0,120}resourcesHeaderState\.resourceType === "server"/,
  "The app header must identify both Function and Web App detail routes.",
);
assert.match(
  shellCompositionSource,
  /className: "playground-source-server-detail-header-switch"[\s\S]{0,500}\{ value: "usage", label: "Usage" \}[\s\S]{0,120}\{ value: "code", label: "Code" \}[\s\S]{0,120}\{ value: "settings", label: "Settings" \}/,
  "Function and Web App detail navigation must use the centralized app-header switch.",
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
  /const agentSettingsPermissionsSummary = React\.createElement\([\s\S]{0,120}PlatformPermissionsSettingsSummary,[\s\S]{0,700}title: "Agent Permissions",[\s\S]{0,220}tooltip: "Controls the permissions this agent has when working\.",[\s\S]{0,120}editLabel: "Manage",[\s\S]{0,300}variant: "default",[\s\S]{0,900}onRingAccessChange: \(ringId, access\) => \{[\s\S]{0,500}updatePlaygroundPermissionRingAccess\([\s\S]{0,300}onEdit: \(\) => setAgentDetailTab\("permissions"\)/,
  "Agent Settings must render editable full-size permission rings with contextual help and a Manage action.",
);
assert.match(
  agentDialogsSource,
  /titleTooltip: "Controls the access levels and permissions users inside teams have when editing or managing this agent\."/,
  "Agent access management must explain that team policies govern users who edit or manage the Agent.",
);
assert.match(
  agentDialogsSource,
  /const agentSettingsTableTabs = React\.createElement\(PlatformDetailTabBar,[\s\S]{0,700}\{ id: "access", label: "Access" \},[\s\S]{0,120}\{ id: "guardrails", label: "Guardrails" \}/,
  "Agent Settings must expose Access and Guardrails as adjacent table tabs.",
);
assert.match(
  agentDialogsSource,
  /tableProps: \{[\s\S]{0,180}title: null,[\s\S]{0,260}leading: agentSettingsTableTabs[\s\S]{0,900}const agentSettingsGuardrailsSection = renderAgentGuardrailsSection\([\s\S]{0,180}leading: agentSettingsTableTabs/,
  "Agent Access and Guardrails must share the same centralized table toolbar tabs.",
);
assert.match(
  agentDialogsSource,
  /tableProps: \{[\s\S]{0,500}pagination: \{\}/,
  "Agent Access must render the centralized data-table footer.",
);
assert.match(
  agentDialogsSource,
  /const agentSettingsSection = agentAccessPrincipalId\s*\?\s*agentAccessSettingsSection\s*:\s*React\.createElement\([\s\S]{0,300}agentSettingsPermissionsSummary,[\s\S]{0,220}normalizedAgentSettingsTableMode === "guardrails"\s*\?\s*agentSettingsGuardrailsSection\s*:\s*agentAccessSettingsSection[\s\S]{0,300}normalizedAgentDetailTab === "settings"\s*\?\s*agentSettingsSection/,
  "Agent Settings must keep permissions above the selected table and isolate principal permission subpages.",
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
  agentBootstrapSource,
  /const pendingRequest = agentDetailRequestInFlightRef\.current\.get\(requestKey\);[\s\S]{0,100}return pendingRequest;/,
  "Agent detail requests must reuse an existing scoped download.",
);
assert.match(
  agentBootstrapSource,
  /agentDetailRequestInFlightRef\.current\.set\(requestKey, requestPromise\);/,
  "Agent detail requests must coalesce concurrent downloads for the same scoped Agent.",
);
assert.match(
  agentBootstrapSource,
  /const hasLoaded = loadedAgentDetailRequestKeysRef\.current\.has\(requestKey\);[\s\S]{0,120}!force && cachedAgent && hasLoaded[\s\S]{0,80}return cachedAgent;/,
  "Agent detail records must load once per scoped Agent for the component lifetime.",
);
assert.match(
  agentBootstrapSource,
  /const currentAgent = current\[normalizedAgentId\] \|\| baseAgent;[\s\S]{0,220}createPlaygroundAgentWithVersionList\(\s*currentAgent,\s*versionItems\s*\)/,
  "Late Agent-version responses must merge into the latest Agent record rather than an incomplete overview snapshot.",
);
assert.match(
  agentBootstrapSource,
  /const currentSelectedVersion = currentVersions\.length > 0[\s\S]{0,260}createPlaygroundAgentWithVersionList\(\s*normalized,\s*currentVersions,\s*currentSelectedVersion\?\.id \|\| ""\s*\)/,
  "Authoritative Agent detail hydration must retain live instructions while attaching cached version metadata.",
);
assert.doesNotMatch(
  agentBootstrapSource,
  /const currentSelectedVersion = currentVersions\.length > 0[\s\S]{0,260}createAgentVersionSelectedResource\(/,
  "Agent detail hydration must not replace live configuration with a cached version snapshot.",
);
assert.match(
  agentBootstrapSource,
  /const hasAuthoritativeDetail = Boolean\([\s\S]{0,180}loadedAgentDetailRequestKeysRef\.current\.has\(detailRequestKey\)[\s\S]{0,320}instructions: currentAgent\.instructions,[\s\S]{0,160}voiceInstructions: currentAgent\.voiceInstructions,[\s\S]{0,180}voicePronunciationReplacements: currentAgent\.voicePronunciationReplacements/,
  "Compact Agent overview refreshes must preserve fields owned by the authoritative detail response.",
);
assert.match(
  agentBootstrapSource,
  /const currentVersions = readPlaygroundAgentVersions\(currentAgent\);[\s\S]{0,360}createPlaygroundAgentWithVersionList\(\s*mergedAgent,\s*currentVersions,\s*currentSelectedVersion\?\.id \|\| ""\s*\)/,
  "Compact Agent overview refreshes must retain loaded version metadata.",
);
assert.match(
  agentBootstrapSource,
  /void loadAgentDetails\(normalizedSelectedAgentId\);[\s\S]{0,100}\}, \[loadAgentDetails, selectedAgentId\]\);/,
  "Agent selection must not refetch merely because the overview Agent collection changed identity.",
);
assert.doesNotMatch(
  agentBootstrapSource,
  /pollAgentInstructions|loadAgentDetails\(normalizedAgentId, \{ force: true, background: true \}\)[\s\S]{0,180}1500/,
  "Agent instruction generation must not periodically replace the full Agent configuration.",
);
assert.match(
  agentBootstrapSource,
  /const onWorkspaceTeamsRequestRef = useRef\(onWorkspaceTeamsRequest\);[\s\S]{0,260}onWorkspaceTeamsRequestRef\.current = onWorkspaceTeamsRequest;/,
  "Agent lifecycle callbacks supplied by the shell must be read through a stable ref.",
);
assert.match(
  agentBootstrapSource,
  /setAgentPermissionChartAnimationKey\(\(current\) => current \+ 1\);[\s\S]{0,140}\}, \[agentDetailTab, selectedAgentId\]\);/,
  "Agent permission presentation state must only reset when the selected Agent or detail tab changes.",
);
assert.match(
  agentBootstrapSource,
  /typeof onWorkspaceTeamsRequestRef\.current !== "function"[\s\S]{0,180}onWorkspaceTeamsRequestRef\.current\(\{\}\);/,
  "Agent workspace team loading must not depend on an unstable callback identity.",
);
assert.match(
  agentBootstrapSource,
  /stringifyPlaygroundVersionComparableValue\(current\[agent\.id\]\)[\s\S]{0,320}Object\.keys\(current\)\.length === Object\.keys\(next\)\.length[\s\S]{0,80}return current;/,
  "Identical Agent list records must not replace the Agent detail cache.",
);
assert.match(
  agentMutationsSource,
  /function requestAgentWorkspaceTeams\(options = \{\}\)[\s\S]{0,240}onWorkspaceTeamsRequestRef\.current\(options\);/,
  "Agent team actions must use the stable workspace-team callback ref.",
);
assert.match(
  shellDataLifecycleSource,
  /const committedAgents = arePlaygroundAgentListsEquivalent\(currentAgents, nextAgents\)[\s\S]{0,260}if \(committedAgents !== currentAgents\)[\s\S]{0,100}setRealAgents\(committedAgents\);/,
  "Semantically identical Agent list refreshes must not propagate a new collection into Agent Details.",
);
assert.match(
  platformTemplateSource,
  /const fallbackTimestamp = id === PLAYGROUND_AGENT_DRAFT_ID \? draft\.createdAt : "";/,
  "Persisted Agent normalization must define a deterministic timestamp fallback.",
);
assert.match(
  platformTemplateSource,
  /createdAt: typeof agent\.createdAt === "string" && agent\.createdAt \? agent\.createdAt : fallbackTimestamp,\s+updatedAt: typeof agent\.updatedAt === "string" && agent\.updatedAt \? agent\.updatedAt : fallbackTimestamp,/,
  "Persisted Agents without timestamps must normalize deterministically instead of receiving a new timestamp per refresh.",
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
assert.doesNotMatch(
  agentDialogsSource,
  /const agentThreadsSection =[\s\S]{0,900}tableOptions: \{[\s\S]{0,260}pagination:/,
  "Agent Threads must not render a pagination footer.",
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
  platformTemplateSource,
  /function canVersionPlaygroundAgent\(agent\)[\s\S]{0,500}isPlaygroundFunctionalAgent\(agent\)[\s\S]{0,160}agent\.isSystem !== true && agent\.isDefault !== true/,
  "Functional agents must use the complete editable and versioned Agent workflow despite being system-owned.",
);
assert.match(
  agentDialogsSource,
  /const canShowAgentVersions = Boolean\([\s\S]{0,320}canVersionPlaygroundAgent\(draftAgent\)/,
  "Functional agents must expose version history and Save Changes controls.",
);
assert.match(
  agentBootstrapSource,
  /const canEditAgentProfilePhoto = Boolean\([\s\S]{0,260}canVersionPlaygroundAgent\(draftAgent\)/,
  "Functional agents must allow profile image changes.",
);
assert.match(
  agentDialogsSource,
  /disabled:\s*saveState\.isSaving \|\| isAgentActionTargetConfigurationLocked,[\s\S]{0,300}"Send to Team"/,
  "The agent title action menu must disable Send to Team for default agents.",
);
assert.match(
  agentDialogsSource,
  /const renderAgentDetailModelSelector\s*=[\s\S]{0,1400}React\.createElement\(PlatformSelector,[\s\S]{0,900}disabled: Boolean\(options\.disabled\)[\s\S]{0,1200}disabled: isTeamAgent \|\| isDefaultAgentConfigurationLocked/,
  "Agent model values must use the centralized selector and remain disabled for locked Agents.",
);
assert.match(
  agentDialogsSource,
  /const renderAgentVoiceSelector\s*=\s*\(\)\s*=>\s*React\.createElement\(PlatformSelector,[\s\S]{0,1400}alignment: "end"[\s\S]{0,300}popupAlignment: "right"[\s\S]{0,300}fullWidth: true/,
  "Agent voice values must use the right-aligned centralized selector.",
);
assert.match(
  agentDialogsSource,
  /const renderAgentExecutionEngineSelector\s*=\s*\(\)\s*=>\s*React\.createElement\(PlatformSelector,[\s\S]{0,1800}ariaLabel: "Select agent engine"/,
  "Agent details must expose the durable execution engine through the centralized sidebar selector.",
);
assert.match(
  agentDialogsSource,
  /renderAgentFactRow\(\s*"Engine",\s*renderAgentExecutionEngineSelector\(\)/,
  "Agent details must render the execution-engine selector in the properties sidebar.",
);
assert.match(
  agentMutationsSource,
  /function buildSanitizedAgentPayload\(agent\)[\s\S]{0,1800}executionEngine: normalizePlaygroundAgentExecutionEngine\(agent\?\.executionEngine\)/,
  "Agent saves must persist the selected execution engine.",
);
assert.match(
  agentBootstrapSource,
  /\["instructions", "model", "executionEngine", "reasoningEffort", "deepResearchModel"\]\.includes\(field\)/,
  "Locked default agents must also protect their execution-engine setting.",
);
assert.match(
  platformTemplateSource,
  /const PLAYGROUND_AGENT_EXECUTION_ENGINE_OPTIONS = \[[\s\S]{0,900}id: "computer-agents-cli"[\s\S]{0,700}id: "grok-build"[\s\S]*?executionEngine: "computer-agents-cli"/,
  "Agent records must define and default the two supported execution engines.",
);
assert.match(
  platformTemplateSource,
  /id: "computer-agents-cli"[\s\S]{0,160}label: "Claude Code"[\s\S]{0,300}iconUrl: "\/img\/020-engine-providers\/claude-code\.svg"/,
  "The standard execution engine must use the Claude Code name and provider icon.",
);
assert.match(
  platformTemplateSource,
  /id: "grok-build"[\s\S]{0,300}description: "Run the selected model with Grok Build through its protected provider endpoint\."[\s\S]{0,160}iconUrl: "\/img\/020-engine-providers\/grok-build\.svg"/,
  "The Grok Build option must describe durable provider-neutral per-agent routing.",
);
assert.match(
  agentDialogsSource,
  /const renderAgentExecutionEngineIcon[\s\S]{0,500}playground-agents-detail-engine-provider-icon[\s\S]{0,1000}leading: renderAgentExecutionEngineIcon\(option\)/,
  "Agent engine selectors must render the matching provider icon in their trigger and options.",
);
assert.match(
  agentBootstrapSource,
  /width: "min\(720px, calc\(100vw - 48px\)\)"[\s\S]{0,80}maxHeight: "70vh"/,
  "The standard agent creation modal must use its wider, compact viewport constraint.",
);
assert.match(
  agentBootstrapSource,
  /const AGENT_THREAD_FETCH_LIMIT = 20;[\s\S]*?fetch\([\s\S]{0,300}"\/threads\?limit="[\s\S]{0,300}"&view=overview"[\s\S]*?\.slice\(0, AGENT_THREAD_FETCH_LIMIT\)/,
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
  /\.playground-agents-detail-sidebar \.playground-agent-detail-sidebar-facts,[\s\S]{0,180}\.playground-agents-detail-sidebar \.playground-agent-detail-sidebar-facts > \.playground-tasks-detail-facts-body\s*\{[\s\S]{0,300}border:\s*0;[\s\S]{0,200}border-radius:\s*0;[\s\S]{0,200}background:\s*transparent;/,
  "The Agent detail facts must not retain a redundant inner frame.",
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

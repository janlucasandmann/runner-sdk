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
const platformTemplateSource = await fs.readFile(
  path.join(domainsRoot, "../templates/platform.template.js"),
  "utf8",
);
const platformTemplateCss = await fs.readFile(
  path.join(domainsRoot, "../templates/platform.template.css"),
  "utf8",
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
  /surfaceProps: \{[\s\S]{0,180}"aria-label": "Connectors actions"/,
  "The Connectors title action must use the matching accessible label.",
);
assert.match(
  platformTemplateCss,
  /\.playground-tasks-toolbar-popup-shell \.playground-tags-plugins-title-menu\s*\{[\s\S]{0,260}left: 0;[\s\S]{0,160}min-width: 220px;/,
  "The Tags and Plugins title menu must open below and toward the content side of its trigger.",
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
  /menuDisabled: skillSaveState\.isSaving \|\| skillCodeFilesTransferState\.isProcessing/,
  "Skill drafts must never disable only the menu segment of Save Changes.",
);
assert.match(
  skillRenderingSource,
  /label: skillSaveState\.isSaving \? "Saving\.\.\." : "Save Changes"[\s\S]{0,180}leading: React\.createElement\(Bookmark/,
  "Skills must use the standard Save Changes label and icon.",
);
assert.match(
  skillRenderingSource,
  /className: "skill-detail-page__access-table",[\s\S]{0,100}title: "Manage Skill Access"/,
  "Skill settings must label the centralized access table.",
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
assert.match(
  agentDialogsSource,
  /renderAgentFactRow\(\s*"Email",\s*renderAgentCopyableFactValue\(\s*"agent-email",\s*agentEmailAddress,\s*"email address",\s*"playground-agents-detail-about-email"/,
  "The Agent details Email value must expose the existing clipboard control.",
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

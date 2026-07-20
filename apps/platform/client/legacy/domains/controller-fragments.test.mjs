import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { AGENTS_CONTROLLER_FRAGMENT_PATHS } from "./agents/source.mjs";
import { ONBOARDING_CONTROLLER_FRAGMENT_PATHS } from "./onboarding/source.mjs";
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
  {
    domain: "onboarding",
    paths: ONBOARDING_CONTROLLER_FRAGMENT_PATHS,
    budget: 1_000,
  },
];

for (const suite of suites) {
  assert.ok(
    suite.paths.length >= (
      suite.domain === "skills"
        ? 3
        : suite.domain === "onboarding"
          ? 2
          : 5
    ),
    `${suite.domain} must remain decomposed into responsibility fragments.`,
  );
  for (const relativePath of suite.paths) {
    const source = await fs.readFile(
      path.join(domainsRoot, suite.domain, relativePath),
      "utf8",
    );
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
  agentMutationsSource.match(/function openCurrentAgentCopyModal\(\)\s*\{[\s\S]*?\n\s*\}/)?.[0] || "",
  /openAgentDraftDetail/,
  "Opening Copy Agent from a detail page must not navigate to a draft route.",
);
assert.match(
  agentDialogsSource,
  /"Copy Agent"[\s\S]*?function openCurrentAgentCopyModal|onClick: openCurrentAgentCopyModal[\s\S]*?"Copy Agent"/,
  "The agent detail sidebar Copy Agent action must use the standard creation modal.",
);
assert.match(
  agentDialogsSource,
  /onClick:\s*\(\)\s*=>\s*openAgentSendToTeamModal\(draftAgent\)[\s\S]*?"Send to Team"/,
  "The agent detail sidebar must pass the current agent explicitly when opening the team publishing modal.",
);
assert.match(
  agentDialogsSource,
  /onClick:\s*\(\)\s*=>\s*openAgentSendToTeamModal\(draftAgent\)[\s\S]*?disabled:\s*!draftAgent\?\.id[\s\S]*?\|\|\s*isDefaultAgentConfigurationLocked[\s\S]*?"Send to Team"/,
  "The agent detail sidebar must disable Send to Team for default agents.",
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

const agentApiModalSource = agentComposerSource.match(
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

const agentSendToTeamModalSource = agentComposerSource.match(
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

console.log(
  "Legacy agent, onboarding, shell, and skills controller fragment budgets passed.",
);

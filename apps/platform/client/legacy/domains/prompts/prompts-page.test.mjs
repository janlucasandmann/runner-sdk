import assert from "node:assert/strict";
import fs from "node:fs/promises";

const promptPageSource = await fs.readFile(
  new URL("./controller/prompts-page.js", import.meta.url),
  "utf8",
);
const toolsRenderingSource = await fs.readFile(
  new URL("../shell/controller/settings-tools-and-rendering.template.js", import.meta.url),
  "utf8",
);
const threadNavigationSource = await fs.readFile(
  new URL("../shell/controller/data-lifecycle-and-navigation.template.js", import.meta.url),
  "utf8",
);
const threadRenderingSource = await fs.readFile(
  new URL("../shell/controller/composition-and-modals.template.js", import.meta.url),
  "utf8",
);
const versioningCoreSource = await fs.readFile(
  new URL("../../versioning-core.mjs", import.meta.url),
  "utf8",
);

assert.match(
  promptPageSource,
  /function getSelectedPromptStorageRegion[\s\S]{0,600}storageRegion[\s\S]{0,300}europe-west1/,
  "Prompt Settings must resolve its storage region from resource metadata.",
);
assert.match(
  promptPageSource,
  /React\.createElement\(PlatformDeploymentMap,[\s\S]{0,300}title: "Storage region"[\s\S]{0,500}promptAccessSettings/,
  "Prompt Settings must place the shared storage region section before access settings.",
);
assert.match(
  promptPageSource,
  /const \[promptOverviewScope, setPromptOverviewScope\] = useState\("all"\)/,
  "Prompt Overview must own its scope filter state.",
);
assert.match(
  promptPageSource,
  /function resolvePromptCreatorName[\s\S]{0,700}currentUserName[\s\S]{0,500}Unknown user/,
  "Prompt Overview must resolve placeholder creators to stable user identities.",
);
assert.match(
  promptPageSource,
  /const scopedRows = useMemo[\s\S]{0,350}row\.isCreatedByCurrentUser/,
  "Prompt Overview must filter visible rows by creator scope.",
);
assert.doesNotMatch(
  promptPageSource,
  /creatorName: prompt\.creatorName \|\| currentUserName \|\| "You"/,
  "Prompt Overview must never expose the legacy You creator placeholder.",
);
assert.match(
  toolsRenderingSource,
  /className: "playground-prompts-overview-scope-switch"[\s\S]{0,700}\{ value: "all", label: "All Prompts" \},[\s\S]{0,160}\{ value: "created", label: "Created by me" \},[\s\S]{0,160}\{ value: "shared", label: "Shared with me" \}/,
  "Prompt Overview must render its centralized scope switch in the app header.",
);
assert.match(
  promptPageSource,
  /onClick: \(\) => onStartThread\?\.\(selectedPrompt\),[\s\S]{0,80}"New Thread"/,
  "Prompt Settings must pass the selected prompt to its New Thread action.",
);
assert.match(
  toolsRenderingSource,
  /onStartThread: \(prompt\) => \{[\s\S]{0,120}handleNewThread\(\{ promptAttachment: prompt \}\)/,
  "Prompt Settings must enter the shared new-thread flow with the selected prompt.",
);
assert.match(
  threadNavigationSource,
  /function handleNewThread\(options = \{\}\)[\s\S]{0,500}options\?\.promptAttachment[\s\S]{0,1400}setPendingThreadPromptAttachmentRequest/,
  "The new-thread flow must stage a prompt attachment request for the composer.",
);
assert.match(
  threadRenderingSource,
  /externalPromptAttachmentRequest: !activeRunnerThreadId[\s\S]{0,500}onExternalPromptAttachmentRequestHandled/,
  "The initial thread composer must consume and acknowledge the staged prompt attachment.",
);
assert.match(
  promptPageSource,
  /async function uploadPromptEditorFiles[\s\S]{0,1000}\/api\/real\/attachments\/upload[\s\S]{0,1200}attachmentId/,
  "Prompt Markdown uploads must persist durable backend attachment references.",
);
assert.match(
  promptPageSource,
  /typeof globalThis\.File === "function" && file instanceof globalThis\.File/,
  "Prompt uploads must use the browser File constructor rather than the Lucide File icon binding.",
);
assert.match(
  promptPageSource,
  /contentVariant: "file-enabled"[\s\S]{0,300}fileUpload: \{[\s\S]{0,300}upload: uploadPromptEditorFiles/,
  "The prompt instructions editor must expose the shared file-upload experience.",
);
assert.doesNotMatch(
  promptPageSource,
  /fileUpload: \{[\s\S]{0,240}disabled: Boolean\(saveState\.isSaving\)/,
  "Prompt file uploads must remain independent from prompt version publishing state.",
);
assert.match(
  promptPageSource,
  /markdown: String\(normalized\.currentVersion\?\.markdown \?\? normalized\.markdown \?\? ""\)/,
  "Prompt version hydration must preserve an intentionally empty Markdown document.",
);
assert.match(
  promptPageSource,
  /function normalizePromptMutationRecord[\s\S]{0,1800}responseVersion\.id[\s\S]{0,900}normalizePromptRecord\(source\)/,
  "Prompt save responses must reconcile the authoritative returned version before rehydrating the editor.",
);
assert.match(
  versioningCoreSource,
  /function renderPlaygroundVersionChangesPage[\s\S]{0,500}React\.createElement\(PlatformVersionChangesPage/,
  "Legacy resource screens must delegate version comparisons to the centralized versioning component.",
);
assert.match(
  promptPageSource,
  /leftSelector: \{[\s\S]{0,350}ariaLabel: "Select base prompt version"[\s\S]{0,350}rightSelector: \{[\s\S]{0,350}ariaLabel: "Select target prompt version"/,
  "Prompt version comparisons must use the centralized left and right selectors.",
);
assert.doesNotMatch(
  promptPageSource,
  /leftLabel: baseVersion|rightLabel: targetVersion|playground-version-changes-select-control/,
  "Prompt version comparisons must not fall back to static labels or native select controls.",
);
assert.match(
  promptPageSource,
  /const \[promptShareTeamIds, setPromptShareTeamIds\] = useState\(\[\]\)/,
  "Prompt sharing must keep a controlled set of selected team IDs.",
);
assert.match(
  promptPageSource,
  /function sharePromptWithTeams\(teamIds\)[\s\S]{0,1800}for \(const team of teamsToShare\)[\s\S]{0,1800}updatePromptAccessMetadata\(nextMetadata\)/,
  "Prompt sharing must grant every selected team before persisting one combined access update.",
);
assert.match(
  promptPageSource,
  /React\.createElement\(PlatformResourceShareModal,[\s\S]{0,500}selectionMode: "multiple"[\s\S]{0,700}onShareTeams:/,
  "Prompt details must use the centralized share modal in multi-team mode.",
);

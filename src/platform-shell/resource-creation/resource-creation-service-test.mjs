import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  RESOURCE_CREATION_APP_SCRIPT_FRAGMENTS,
} from "./index.mjs";

assert.match(
  RESOURCE_CREATION_APP_SCRIPT_FRAGMENTS.state,
  /platformResourceCreationRequest/,
);
assert.match(
  RESOURCE_CREATION_APP_SCRIPT_FRAGMENTS.actions,
  /function openPlatformResourceCreationModal/,
);
assert.match(
  RESOURCE_CREATION_APP_SCRIPT_FRAGMENTS.actions,
  /resourceType === "computer"/,
);
assert.doesNotMatch(
  RESOURCE_CREATION_APP_SCRIPT_FRAGMENTS.actions,
  /setActivePage|openResourcesView/,
);
assert.match(
  RESOURCE_CREATION_APP_SCRIPT_FRAGMENTS.host,
  /React\.createElement\(PlaygroundAgentsPage/,
);
assert.match(
  RESOURCE_CREATION_APP_SCRIPT_FRAGMENTS.host,
  /React\.createElement\(PlaygroundEnvironmentsPage/,
);
assert.match(
  RESOURCE_CREATION_APP_SCRIPT_FRAGMENTS.host,
  /creationOnly: true/,
);
assert.match(
  RESOURCE_CREATION_APP_SCRIPT_FRAGMENTS.host,
  /onCreationRequestClose: closePlatformResourceCreationModal/,
);

for (const fragment of Object.values(RESOURCE_CREATION_APP_SCRIPT_FRAGMENTS)) {
  assert.doesNotThrow(() => new Function(fragment));
}

const computerCreationControllerSource = await fs.readFile(
  new URL(
    "../../../apps/platform/client/legacy/domains/compute-resources/controller/server-versioning-and-composers.js",
    import.meta.url,
  ),
  "utf8",
);
assert.match(
  computerCreationControllerSource,
  /function renderEnvironmentCreationSetupModal/,
);
assert.match(
  computerCreationControllerSource,
  /function renderEnvironmentCreationSetupModal[\s\S]*headerVariant: "search"/,
);
assert.match(
  computerCreationControllerSource,
  /headerSearchProps: \{[\s\S]*inputRef: environmentCreationNameInputRef/,
);
assert.match(
  computerCreationControllerSource,
  /headerSearchProps: \{[\s\S]*icon: Monitor/,
);
assert.doesNotMatch(
  computerCreationControllerSource,
  /playground-computer-creation-modal-avatar/,
);
assert.doesNotMatch(
  computerCreationControllerSource,
  /function renderEnvironmentCreationSetupPage/,
);
assert.doesNotMatch(
  computerCreationControllerSource,
  /function renderEnvironmentComposerDialog/,
);
assert.match(
  computerCreationControllerSource,
  /function renderDevelopResourceCreationSetupModal/,
);
const developResourceCreationModalSource = computerCreationControllerSource.match(
  /function renderDevelopResourceCreationSetupModal[\s\S]*?\n\s*function renderServerComposerDialog/,
)?.[0] || "";
assert.match(
  developResourceCreationModalSource,
  /React\.createElement\(PlatformModal/,
);
assert.match(
  developResourceCreationModalSource,
  /headerVariant: "search"/,
);
assert.match(
  developResourceCreationModalSource,
  /inputRef: serverCreationNameInputRef/,
);
assert.match(
  developResourceCreationModalSource,
  /creationIconByKind = \{[\s\S]*web_app: Globe,[\s\S]*function: FunctionSquare,[\s\S]*database: Database,[\s\S]*auth: Shield,[\s\S]*secrets: Key,[\s\S]*payments: ReceiptText/,
);
assert.match(
  developResourceCreationModalSource,
  /React\.createElement\(PlatformInstructionsEditor[\s\S]*variant: "minimalistic-ui"/,
);
assert.match(
  developResourceCreationModalSource,
  /React\.createElement\(PlatformSelector[\s\S]*isWebAppComposer[\s\S]*"Template"[\s\S]*"Auth"/,
);
assert.doesNotMatch(
  developResourceCreationModalSource,
  /renderServerCreationSettings|"Settings"|"Type"|"Region"|databaseLocation/,
);
assert.doesNotMatch(
  developResourceCreationModalSource,
  /PlatformModalBackdrop|PlatformModalSurface/,
);

const resourceCreationCompositionSource = await fs.readFile(
  new URL(
    "../../../apps/platform/client/legacy/domains/compute-resources/controller/overview-and-composition.js",
    import.meta.url,
  ),
  "utf8",
);
assert.match(
  resourceCreationCompositionSource,
  /!isDevelopResourceCreationModalKind\(normalizedEmbeddedServerKind\)/,
);
assert.match(
  resourceCreationCompositionSource,
  /renderDevelopResourceCreationSetupModal\(\)/,
);

const resourceCreationHeaderSource = await fs.readFile(
  new URL(
    "../../../apps/platform/client/legacy/domains/compute-resources/controller/bootstrap-and-effects.js",
    import.meta.url,
  ),
  "utf8",
);
assert.match(
  resourceCreationHeaderSource,
  /const developResourceCreationModalKinds = \[[\s\S]*"web_app"[\s\S]*"function"[\s\S]*"database"[\s\S]*"auth"[\s\S]*"secrets"[\s\S]*"payments"[\s\S]*\]/,
);
assert.match(
  resourceCreationHeaderSource,
  /const isResourceCreateViewOpen = Boolean\([\s\S]*serverComposerOpen[\s\S]*!isDevelopResourceCreationModalKind\(normalizedEmbeddedServerKind\)[\s\S]*\);[\s\S]*const shouldUseDetailHeader = !isHomeViewActive \|\| isResourceCreateViewOpen/,
);

const computerCreationLifecycleSource = await fs.readFile(
  new URL(
    "../../../apps/platform/client/legacy/domains/compute-resources/controller/catalog-and-lifecycle.js",
    import.meta.url,
  ),
  "utf8",
);
assert.match(
  computerCreationLifecycleSource,
  /useEffect\(\(\) => \{\s*if \(creationOnly\) \{\s*return;\s*\}\s*const normalizedTargetEnvironmentId/,
);
assert.match(
  computerCreationLifecycleSource,
  /\[creationOnly, environmentComposerOpen, navigationTargetEnvironmentId, navigationToken, orderedEnvironments\]/,
);

const resourceNavigationSource = await fs.readFile(
  new URL(
    "../../../apps/platform/client/legacy/domains/shell/controller/data-lifecycle-and-navigation.template.js",
    import.meta.url,
  ),
  "utf8",
);
assert.match(
  resourceNavigationSource,
  /normalizedView === "computers" && options\.create === true[\s\S]*openPlatformResourceCreationModal\("computer"\)/,
);

const computerCreationRoutingSource = await fs.readFile(
  new URL(
    "../../../apps/platform/client/legacy/domains/compute-resources/controller/routing-access-and-connections.js",
    import.meta.url,
  ),
  "utf8",
);
assert.match(
  computerCreationRoutingSource,
  /function openEnvironmentComposer\(\)[\s\S]*setEnvironmentComposerDraft\(\{[\s\S]*name: "",/,
);
assert.match(
  computerCreationRoutingSource,
  /function openServerComposer\(serverKind = ""\)[\s\S]*shouldKeepEmbeddedResourceOverviewVisible[\s\S]*isDevelopResourceCreationModalKind\(normalizedServerKind\)[\s\S]*setIsHomeViewActive\(shouldKeepEmbeddedResourceOverviewVisible\)/,
);
assert.match(
  computerCreationRoutingSource,
  /function openServerComposer\(serverKind = ""\)[\s\S]*isDevelopResourceCreationModalKind\(normalizedServerKind\) \? \{ name: "" \} : \{\}/,
);

const serverCreationMutationSource = await fs.readFile(
  new URL(
    "../../../apps/platform/client/legacy/domains/compute-resources/controller/mutations-and-data.js",
    import.meta.url,
  ),
  "utf8",
);
assert.match(
  serverCreationMutationSource,
  /const savedServer = await persistServerRecord[\s\S]*setIsHomeViewActive\(false\);[\s\S]*setSelectedServerId\(savedServer\.id\)/,
);

const platformStylesSource = await fs.readFile(
  new URL(
    "../../../apps/platform/client/legacy/templates/platform.template.css",
    import.meta.url,
  ),
  "utf8",
);
assert.match(
  platformStylesSource,
  /\.playground-computer-creation-modal \.playground-environment-profile-selector\s*\{[\s\S]*margin-bottom:\s*12px;/,
);
assert.match(
  platformStylesSource,
  /\.playground-computer-creation-modal \.playground-environment-profile-card\s*\{[\s\S]*border-radius:\s*10px;/,
);
assert.match(
  platformStylesSource,
  /\.playground-develop-resource-creation-modal\.platform-modal-surface\s*\{[\s\S]*height:\s*auto;/,
);
assert.match(
  platformStylesSource,
  /\.playground-develop-resource-creation-modal \.playground-develop-resource-creation-description-editor\.platform-instructions-editor\s*\{[\s\S]*margin:\s*24px 0 0;/,
);

console.log("Platform resource creation host contracts passed.");

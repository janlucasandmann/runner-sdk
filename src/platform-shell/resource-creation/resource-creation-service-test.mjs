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

console.log("Platform resource creation host contracts passed.");

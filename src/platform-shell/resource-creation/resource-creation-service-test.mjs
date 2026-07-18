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

console.log("Platform resource creation host contracts passed.");

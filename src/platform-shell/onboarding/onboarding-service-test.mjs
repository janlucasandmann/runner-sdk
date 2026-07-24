import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  ONBOARDING_APP_SCRIPT_FRAGMENTS,
  ONBOARDING_CSS,
  ONBOARDING_PAGE_SCRIPT,
  ONBOARDING_STEP_IDS,
  createPlaygroundOnboardingSnapshot,
  normalizePlaygroundOnboardingSnapshot,
  normalizePlaygroundOnboardingStepIndex,
  shouldAutoOpenPlaygroundOnboarding,
} from "./index.mjs";

assert.deepEqual(ONBOARDING_STEP_IDS, [
  "welcome",
  "computer",
  "agents",
  "connectors",
  "plan",
]);
assert.equal(normalizePlaygroundOnboardingStepIndex(-4), 0);
assert.equal(normalizePlaygroundOnboardingStepIndex(2.6), 3);
assert.equal(normalizePlaygroundOnboardingStepIndex(99), 4);
assert.deepEqual(
  createPlaygroundOnboardingSnapshot({ stepIndex: 2, dismissed: true }),
  { version: 1, stepIndex: 2, dismissed: true },
);
assert.deepEqual(
  normalizePlaygroundOnboardingSnapshot(null),
  { version: 1, stepIndex: 0, dismissed: false },
);
assert.equal(shouldAutoOpenPlaygroundOnboarding({
  sessionStatus: "authenticated",
  onboardingCompleted: false,
  open: false,
  dismissedForSession: false,
}), true);
assert.equal(shouldAutoOpenPlaygroundOnboarding({
  sessionStatus: "authenticated",
  onboardingCompleted: false,
  open: false,
  dismissedForSession: true,
}), false);

assert.deepEqual(
  Object.keys(ONBOARDING_APP_SCRIPT_FRAGMENTS).sort(),
  ["host", "lifecycle", "navigation", "runtime", "state"],
);
for (const fragment of Object.values(ONBOARDING_APP_SCRIPT_FRAGMENTS)) {
  assert.doesNotThrow(() => new Function(fragment));
}
assert.doesNotThrow(() => new Function(ONBOARDING_PAGE_SCRIPT));

assert.match(ONBOARDING_PAGE_SCRIPT, /function PlaygroundOnboardingModal/);
assert.match(ONBOARDING_PAGE_SCRIPT, /PlatformModalBackdrop/);
assert.match(ONBOARDING_PAGE_SCRIPT, /PlatformModalSurface/);
assert.match(ONBOARDING_PAGE_SCRIPT, /onDismiss/);
assert.match(ONBOARDING_PAGE_SCRIPT, /onComplete/);
assert.match(ONBOARDING_PAGE_SCRIPT, /onboardingStepIndex/);
assert.match(ONBOARDING_PAGE_SCRIPT, /files\/upload/);
assert.doesNotMatch(ONBOARDING_PAGE_SCRIPT, /const conceptPages/);
assert.doesNotMatch(ONBOARDING_PAGE_SCRIPT, /function renderFooter/);
assert.doesNotMatch(ONBOARDING_PAGE_SCRIPT, /renderResourcesConfig/);
assert.doesNotMatch(ONBOARDING_PAGE_SCRIPT, /renderProjectConfig/);
assert.doesNotMatch(ONBOARDING_PAGE_SCRIPT, /onCreateProject/);

assert.match(
  ONBOARDING_APP_SCRIPT_FRAGMENTS.navigation,
  /function dismissPlaygroundOnboarding[\s\S]*dismissed: true/,
);
assert.doesNotMatch(
  ONBOARDING_APP_SCRIPT_FRAGMENTS.navigation.match(
    /function dismissPlaygroundOnboarding[\s\S]*?\n        \}/,
  )?.[0] || "",
  /onboardingCompleted: true/,
);
assert.match(
  ONBOARDING_APP_SCRIPT_FRAGMENTS.navigation,
  /function completePlaygroundOnboarding[\s\S]*onboardingCompleted: true/,
);
assert.match(
  ONBOARDING_APP_SCRIPT_FRAGMENTS.runtime,
  /ensureAndWarmOnboardingDefaultEnvironment/,
);
assert.match(
  ONBOARDING_APP_SCRIPT_FRAGMENTS.host,
  /renderPlaygroundOnboardingHost/,
);

assert.match(ONBOARDING_CSS, /\.playground-onboarding-scrim/);
assert.match(ONBOARDING_CSS, /\.playground-onboarding-modal/);

const shellBootstrapSource = await fs.readFile(
  new URL(
    "../../../apps/platform/client/legacy/domains/shell/controller/bootstrap-account-and-connectors.template.js",
    import.meta.url,
  ),
  "utf8",
);
const shellRuntimeSource = await fs.readFile(
  new URL(
    "../../../apps/platform/client/legacy/domains/shell/controller/data-lifecycle-and-navigation.template.js",
    import.meta.url,
  ),
  "utf8",
);
const shellCompositionSource = await fs.readFile(
  new URL(
    "../../../apps/platform/client/legacy/domains/shell/controller/composition-and-modals.template.js",
    import.meta.url,
  ),
  "utf8",
);
const platformTemplateSource = await fs.readFile(
  new URL(
    "../../../apps/platform/client/legacy/templates/platform.template.js",
    import.meta.url,
  ),
  "utf8",
);
const platformTemplateCss = await fs.readFile(
  new URL(
    "../../../apps/platform/client/legacy/templates/platform.template.css",
    import.meta.url,
  ),
  "utf8",
);
const platformBindingsSource = await fs.readFile(
  new URL(
    "../../../apps/platform/client/legacy/create-legacy-platform-application.mjs",
    import.meta.url,
  ),
  "utf8",
);

assert.match(shellBootstrapSource, /ONBOARDING_APP_SCRIPT_FRAGMENTS\.state/);
assert.match(shellBootstrapSource, /ONBOARDING_APP_SCRIPT_FRAGMENTS\.navigation/);
assert.match(shellBootstrapSource, /ONBOARDING_APP_SCRIPT_FRAGMENTS\.lifecycle/);
assert.doesNotMatch(shellBootstrapSource, /function closePlaygroundOnboarding/);
assert.match(shellRuntimeSource, /ONBOARDING_APP_SCRIPT_FRAGMENTS\.runtime/);
assert.doesNotMatch(shellRuntimeSource, /function ensureAndWarmOnboardingDefaultEnvironment/);
assert.match(shellCompositionSource, /ONBOARDING_APP_SCRIPT_FRAGMENTS\.host/);
assert.doesNotMatch(shellCompositionSource, /React\.createElement\(PlaygroundOnboardingModal/);
assert.doesNotMatch(platformTemplateSource, /function readPlaygroundOnboardingState/);
assert.doesNotMatch(platformTemplateCss, /\.playground-onboarding-scrim/);
assert.match(platformBindingsSource, /ONBOARDING_PAGE_SCRIPT/);
assert.match(platformBindingsSource, /ONBOARDING_CSS/);

console.log("Platform shell onboarding contracts passed.");

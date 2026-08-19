import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  IMAGINE_APP_SCRIPT_FRAGMENTS,
  IMAGINE_PAGE_CSS,
  IMAGINE_PAGE_CSS_FRAGMENTS,
  IMAGINE_PAGE_SCRIPT,
  IMAGINE_PAGE_SCRIPT_FRAGMENTS,
  IMAGINE_SHELL_STYLE_FRAGMENTS,
  IMAGINE_TEMPLATE_PAGE_CSS,
  IMAGINE_TEMPLATE_PAGE_CSS_FRAGMENTS,
  IMAGINE_TEMPLATE_PAGE_SCRIPT,
  IMAGINE_TEMPLATE_PAGE_SCRIPT_FRAGMENTS,
  createImagineService,
} from "./index.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

assert.match(IMAGINE_PAGE_SCRIPT_FRAGMENTS.foundation, /function normalizePlaygroundImagineTemplateAssets/);
assert.match(IMAGINE_PAGE_SCRIPT_FRAGMENTS.templateMedia, /function PlaygroundImagineTemplatePreviewMedia/);
assert.match(IMAGINE_PAGE_SCRIPT_FRAGMENTS.controller, /function PlaygroundImaginePage/);
assert.match(IMAGINE_PAGE_SCRIPT_FRAGMENTS.controller, /onOpenPromptSearch/);
assert.match(IMAGINE_PAGE_SCRIPT_FRAGMENTS.controller, /onOpenKnowledgeSearch/);
assert.match(IMAGINE_PAGE_SCRIPT_FRAGMENTS.controller, /onOpenThreadSearch/);
assert.match(IMAGINE_PAGE_SCRIPT_FRAGMENTS.templateEditor, /handleCreateTemplateSubmit/);
assert.match(IMAGINE_PAGE_SCRIPT_FRAGMENTS.generation, /imagineThreadMetadata/);
assert.match(IMAGINE_PAGE_SCRIPT_FRAGMENTS.generation, /onOpenPromptSearch/);
assert.match(IMAGINE_PAGE_SCRIPT_FRAGMENTS.generation, /onOpenKnowledgeSearch/);
assert.match(IMAGINE_PAGE_SCRIPT_FRAGMENTS.generation, /onOpenThreadSearch/);
assert.doesNotMatch(IMAGINE_PAGE_SCRIPT_FRAGMENTS.view, /openPromptSearch\(/);
assert.doesNotMatch(IMAGINE_PAGE_SCRIPT_FRAGMENTS.generation, /openPromptSearch\(/);
assert.match(IMAGINE_PAGE_SCRIPT, /function PlaygroundImaginePage/);
assert.match(IMAGINE_PAGE_CSS_FRAGMENTS.foundation, /\.playground-content-body\.is-imagine-page/);
assert.match(IMAGINE_PAGE_CSS_FRAGMENTS.gallery, /\.playground-imagine-grid-scroll/);
assert.match(IMAGINE_PAGE_CSS_FRAGMENTS.templateEditor, /\.playground-imagine-create-page/);
assert.match(IMAGINE_PAGE_CSS, /\.playground-imagine-composer-wrap/);

assert.match(IMAGINE_TEMPLATE_PAGE_SCRIPT_FRAGMENTS.foundation, /function normalizePlaygroundImagineTemplatePageAssets/);
assert.match(IMAGINE_TEMPLATE_PAGE_SCRIPT_FRAGMENTS.controller, /function PlaygroundImagineTemplatePage/);
assert.match(IMAGINE_TEMPLATE_PAGE_SCRIPT_FRAGMENTS.controller, /onOpenPromptSearch/);
assert.match(IMAGINE_TEMPLATE_PAGE_SCRIPT_FRAGMENTS.controller, /onOpenKnowledgeSearch/);
assert.match(IMAGINE_TEMPLATE_PAGE_SCRIPT_FRAGMENTS.controller, /onOpenThreadSearch/);
assert.match(IMAGINE_TEMPLATE_PAGE_SCRIPT_FRAGMENTS.sharing, /handleShareTemplateWithTeam/);
assert.doesNotMatch(IMAGINE_TEMPLATE_PAGE_SCRIPT_FRAGMENTS.view, /openPromptSearch\(/);
assert.match(IMAGINE_TEMPLATE_PAGE_SCRIPT, /function PlaygroundImagineTemplatePage/);
assert.match(IMAGINE_TEMPLATE_PAGE_CSS_FRAGMENTS.configuration, /\.playground-imagine-template-config/);
assert.match(IMAGINE_TEMPLATE_PAGE_CSS_FRAGMENTS.detailSurface, /\.playground-imagine-template-action-rail/);
assert.match(IMAGINE_TEMPLATE_PAGE_CSS, /\.playground-imagine-template-settings-back/);

assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.state, /imagineActiveView/);
assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.navigation, /function openImaginePage/);
assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.topNavigation, /function renderImagineTopNavControls/);
assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.topNavigation, /React\.createElement\(PlatformSwitch/);
assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.topNavigation, /value: "explore", label: "All Templates"/);
assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.topNavigation, /React\.createElement\(PlatformSecondaryButton/);
assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.topNavigation, /React\.createElement\(PlatformPrimaryButton/);
assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.topNavigation, /React\.createElement\(PlatformPopup/);
assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.topNavigation, /rootClassName: "playground-imagine-filter-shell"/);
assert.doesNotMatch(IMAGINE_APP_SCRIPT_FRAGMENTS.topNavigation, /className: "content-mode-switch/);
assert.doesNotMatch(IMAGINE_APP_SCRIPT_FRAGMENTS.topNavigation, /className: "playground-files-control-button is-backlog/);
assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.teamTemplateReader, /function readTeamPageCustomImagineTemplates/);
assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.teamResourceNavigation, /function openTeamResourceImagineTemplateRow/);
assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "imagine"/);
assert.match(IMAGINE_SHELL_STYLE_FRAGMENTS.toolbar, /\.playground-imagine-media-mode-selector/);

assert.doesNotThrow(() => new Function(IMAGINE_APP_SCRIPT_FRAGMENTS.topNavigation));
assert.doesNotThrow(() => new Function(IMAGINE_PAGE_SCRIPT));
assert.doesNotThrow(() => new Function(IMAGINE_TEMPLATE_PAGE_SCRIPT));

const platformEntrySource = await readPlatformCompositionSource();
const filesToolbarSource = await fs.readFile(
  new URL("../files/client/styles/toolbar.mjs", import.meta.url),
  "utf8",
);

assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/create-mode\/imagine\/index\.mjs"/);
assert.match(platformEntrySource, /imagineService\.handleRequest\(req, res, url\)/);
assert.match(platformEntrySource, /\$\{IMAGINE_PAGE_SCRIPT\}/);
assert.match(platformEntrySource, /\$\{IMAGINE_APP_SCRIPT_FRAGMENTS\.topNavigation\}/);
assert.match(platformEntrySource, /\$\{IMAGINE_SHELL_STYLE_FRAGMENTS\.toolbar\}/);
assert.doesNotMatch(platformEntrySource, /demo-imagine-page\.mjs/);
assert.doesNotMatch(platformEntrySource, /function PlaygroundImaginePage/);
assert.doesNotMatch(platformEntrySource, /function PlaygroundImagineTemplatePage/);
assert.doesNotMatch(platformEntrySource, /function renderImagineTopNavControls/);
assert.doesNotMatch(platformEntrySource, /function openImaginePage/);
assert.doesNotMatch(platformEntrySource, /function readTeamPageCustomImagineTemplates/);
assert.doesNotMatch(platformEntrySource, /url\.pathname === "\/api\/aios\/user\/imagine-preferences"/);
assert.doesNotMatch(filesToolbarSource, /\.playground-imagine-media-mode-selector/);

const calls = [];
const imagineService = createImagineService({
  proxyAiosJsonRequest: (...args) => calls.push(args),
});

function dispatch(method, pathname) {
  calls.length = 0;
  const req = { method, url: pathname, headers: {} };
  const res = {};
  const handled = imagineService.handleRequest(req, res, new URL(pathname, "http://localhost"));
  return { handled, call: calls[0] };
}

let result = dispatch("GET", "/api/aios/user/imagine-preferences");
assert.equal(result.handled, true);
assert.equal(result.call[2], "/api/user/imagine-preferences");
assert.equal(result.call[3], "GET");

result = dispatch("PATCH", "/api/aios/user/imagine-preferences");
assert.equal(result.handled, true);
assert.equal(result.call[3], "PATCH");

result = dispatch("DELETE", "/api/aios/user/imagine-preferences");
assert.equal(result.handled, true);
assert.equal(result.call[3], "DELETE");

result = dispatch("POST", "/api/aios/user/imagine-preferences");
assert.equal(result.handled, false);
assert.equal(result.call, undefined);

result = dispatch("GET", "/api/aios/user/profile");
assert.equal(result.handled, false);
assert.equal(result.call, undefined);

assert.throws(
  () => createImagineService({}),
  /proxyAiosJsonRequest adapter/,
);

console.log("Imagine service module, composition, browser syntax, style ownership, and route contracts passed.");

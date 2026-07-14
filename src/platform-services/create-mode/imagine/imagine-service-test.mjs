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

assert.match(IMAGINE_PAGE_SCRIPT_FRAGMENTS.foundation, /function normalizePlaygroundImagineTemplateAssets/);
assert.match(IMAGINE_PAGE_SCRIPT_FRAGMENTS.templateMedia, /function PlaygroundImagineTemplatePreviewMedia/);
assert.match(IMAGINE_PAGE_SCRIPT_FRAGMENTS.controller, /function PlaygroundImaginePage/);
assert.match(IMAGINE_PAGE_SCRIPT_FRAGMENTS.templateEditor, /handleCreateTemplateSubmit/);
assert.match(IMAGINE_PAGE_SCRIPT_FRAGMENTS.generation, /imagineThreadMetadata/);
assert.match(IMAGINE_PAGE_SCRIPT, /function PlaygroundImaginePage/);
assert.match(IMAGINE_PAGE_CSS_FRAGMENTS.foundation, /\.playground-content-body\.is-imagine-page/);
assert.match(IMAGINE_PAGE_CSS_FRAGMENTS.gallery, /\.playground-imagine-grid-scroll/);
assert.match(IMAGINE_PAGE_CSS_FRAGMENTS.templateEditor, /\.playground-imagine-create-page/);
assert.match(IMAGINE_PAGE_CSS, /\.playground-imagine-composer-wrap/);

assert.match(IMAGINE_TEMPLATE_PAGE_SCRIPT_FRAGMENTS.foundation, /function normalizePlaygroundImagineTemplatePageAssets/);
assert.match(IMAGINE_TEMPLATE_PAGE_SCRIPT_FRAGMENTS.controller, /function PlaygroundImagineTemplatePage/);
assert.match(IMAGINE_TEMPLATE_PAGE_SCRIPT_FRAGMENTS.sharing, /handleShareTemplateWithTeam/);
assert.match(IMAGINE_TEMPLATE_PAGE_SCRIPT, /function PlaygroundImagineTemplatePage/);
assert.match(IMAGINE_TEMPLATE_PAGE_CSS_FRAGMENTS.configuration, /\.playground-imagine-template-config/);
assert.match(IMAGINE_TEMPLATE_PAGE_CSS_FRAGMENTS.detailSurface, /\.playground-imagine-template-action-rail/);
assert.match(IMAGINE_TEMPLATE_PAGE_CSS, /\.playground-imagine-template-settings-back/);

assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.state, /imagineActiveView/);
assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.navigation, /function openImaginePage/);
assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.topNavigation, /function renderImagineTopNavControls/);
assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.teamTemplateReader, /function readTeamPageCustomImagineTemplates/);
assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.teamResourceNavigation, /function openTeamResourceImagineTemplateRow/);
assert.match(IMAGINE_APP_SCRIPT_FRAGMENTS.sidebarEntry, /id: "imagine"/);
assert.match(IMAGINE_SHELL_STYLE_FRAGMENTS.toolbar, /\.playground-imagine-media-mode-selector/);

assert.doesNotThrow(() => new Function(IMAGINE_PAGE_SCRIPT));
assert.doesNotThrow(() => new Function(IMAGINE_TEMPLATE_PAGE_SCRIPT));

const demoServerSource = await fs.readFile(
  new URL("../../../../examples/demo-server.mjs", import.meta.url),
  "utf8",
);
const filesToolbarSource = await fs.readFile(
  new URL("../files/client/styles/toolbar.mjs", import.meta.url),
  "utf8",
);

assert.match(demoServerSource, /from "\.\.\/src\/platform-services\/create-mode\/imagine\/index\.mjs"/);
assert.match(demoServerSource, /imagineService\.handleRequest\(req, res, url\)/);
assert.match(demoServerSource, /\$\{IMAGINE_PAGE_SCRIPT\}/);
assert.match(demoServerSource, /\$\{IMAGINE_APP_SCRIPT_FRAGMENTS\.topNavigation\}/);
assert.match(demoServerSource, /\$\{IMAGINE_SHELL_STYLE_FRAGMENTS\.toolbar\}/);
assert.doesNotMatch(demoServerSource, /demo-imagine-page\.mjs/);
assert.doesNotMatch(demoServerSource, /function PlaygroundImaginePage/);
assert.doesNotMatch(demoServerSource, /function PlaygroundImagineTemplatePage/);
assert.doesNotMatch(demoServerSource, /function renderImagineTopNavControls/);
assert.doesNotMatch(demoServerSource, /function openImaginePage/);
assert.doesNotMatch(demoServerSource, /function readTeamPageCustomImagineTemplates/);
assert.doesNotMatch(demoServerSource, /url\.pathname === "\/api\/aios\/user\/imagine-preferences"/);
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

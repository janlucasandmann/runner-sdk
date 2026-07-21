import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  CALENDAR_BROWSER_FOUNDATION_FRAGMENTS,
  CALENDAR_DOMAIN_RUNTIME_SCRIPT,
  CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS,
  CALENDAR_PROJECTS_PAGE_CONNECTOR_FRAGMENTS,
  CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS,
  CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS,
  CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS,
  CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT,
  CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT,
  CALENDAR_SHELL_SCRIPT_FRAGMENTS,
  CALENDAR_STYLE_FRAGMENTS,
  CALENDAR_VENDOR_HEAD_HTML,
  createCalendarService,
} from "./index.mjs";
import {
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  PROJECTS_PAGE_RUNTIME_SCRIPT,
} from "../projects/index.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

assert.match(CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT, /function buildPlaygroundDefaultScheduleDraft/);
assert.match(CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT, /function normalizePlaygroundScheduleRecord/);
assert.match(CALENDAR_DOMAIN_RUNTIME_SCRIPT, /function buildPlaygroundCalendarVisibleRange/);
assert.match(CALENDAR_DOMAIN_RUNTIME_SCRIPT, /function buildPlaygroundScheduleCalendarEvents/);
assert.doesNotMatch(CALENDAR_DOMAIN_RUNTIME_SCRIPT, /function PlaygroundWelcomeCalendarWidget/);
assert.match(CALENDAR_DOMAIN_RUNTIME_SCRIPT, /function buildPlaygroundWelcomeCalendarWidgetView/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.collectionState, /calendarMetronomeWorkflows/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.topNavigation, /formatScheduleCalendarHeaderLabel/);
assert.match(CALENDAR_PROJECTS_PAGE_SHELL_FRAGMENTS.topNavigation, /onCalendarTopNavStateChange/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.loading, /async function loadProjectSchedules/);
assert.match(CALENDAR_PROJECTS_PAGE_DATA_FRAGMENTS.persistence, /async function persistScheduleDraft/);
assert.match(CALENDAR_PROJECTS_PAGE_ACTION_FRAGMENTS.scheduleDialog, /function handleTaskScheduleDialogSave/);
assert.match(CALENDAR_PROJECTS_PAGE_CONNECTOR_FRAGMENTS.scheduleDialogView, /function renderTaskScheduleDialog/);
assert.match(CALENDAR_PROJECTS_PAGE_CONNECTOR_FRAGMENTS.scheduleDialogView, /\{ embedded = false \} = \{\}/);
assert.match(CALENDAR_PROJECTS_PAGE_CONNECTOR_FRAGMENTS.scheduleDialogView, /className: "playground-tasks-schedule-type-switch"/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /function renderScheduleDetailPanel/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /function renderCalendarView/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /toolbar: !isStandaloneCalendarMode/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.calendar, /React\.createElement\(PlatformSwitch/);
assert.match(CALENDAR_PROJECTS_PAGE_VIEW_FRAGMENTS.standaloneWorkspace, /function renderStandaloneCalendarWorkspace/);
assert.match(CALENDAR_BROWSER_FOUNDATION_FRAGMENTS.calendarImport, /react-big-calendar/);
assert.match(CALENDAR_BROWSER_FOUNDATION_FRAGMENTS.localizer, /dateFnsLocalizer/);
assert.match(CALENDAR_SHELL_SCRIPT_FRAGMENTS.navigation, /function openCalendarPage/);
assert.match(CALENDAR_SHELL_SCRIPT_FRAGMENTS.state, /calendarTopNavActionsRef/);
assert.match(CALENDAR_SHELL_SCRIPT_FRAGMENTS.topNavigation, /function renderCalendarTopNavActions/);
assert.match(CALENDAR_SHELL_SCRIPT_FRAGMENTS.topNavigation, /value: "day", label: "Day"/);
assert.match(CALENDAR_STYLE_FRAGMENTS.scheduler, /playground-tasks-scheduler/);
assert.match(CALENDAR_STYLE_FRAGMENTS.welcomeWidget, /playground-thread-widget-calendar/);
assert.match(CALENDAR_VENDOR_HEAD_HTML, /react-big-calendar@1\.19\.4/);

assert.match(PROJECTS_DOMAIN_RUNTIME_SCRIPT, /function buildPlaygroundCalendarVisibleRange/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /function renderCalendarView/);
assert.match(PROJECTS_PAGE_RUNTIME_SCRIPT, /function renderStandaloneCalendarWorkspace/);

const platformEntrySource = await readPlatformCompositionSource();
const projectsDomainSource = await fs.readFile(new URL("../projects/client/domain-runtime.mjs", import.meta.url), "utf8");
const projectsDataSource = await fs.readFile(new URL("../projects/client/page/data.mjs", import.meta.url), "utf8");
const projectsViewsSource = await fs.readFile(new URL("../projects/client/page/views.mjs", import.meta.url), "utf8");
const projectsRoutesSource = await fs.readFile(new URL("../projects/server/routes.mjs", import.meta.url), "utf8");

assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/create-mode\/calendar\/index\.mjs"/);
assert.match(platformEntrySource, /calendarService\.handleRequest\(req, res, url\)/);
assert.doesNotMatch(platformEntrySource, /function openCalendarPage/);
assert.doesNotMatch(platformEntrySource, /^\s*\.playground-tasks-scheduler\s*\{/m);
assert.doesNotMatch(platformEntrySource, /^\s*\.playground-thread-widget-calendar\s*\{/m);
assert.doesNotMatch(projectsDomainSource, /function buildPlaygroundCalendarVisibleRange/);
assert.doesNotMatch(projectsDomainSource, /function normalizePlaygroundScheduleRecord/);
assert.doesNotMatch(projectsDataSource, /async function loadProjectSchedules/);
assert.doesNotMatch(projectsViewsSource, /function renderCalendarView/);
assert.doesNotMatch(projectsRoutesSource, /\/api\/real\/schedules/);

const calls = [];
const calendarService = createCalendarService({
  proxyUpstreamGet: (...args) => calls.push({ adapter: "get", args }),
  proxyUpstreamJsonRequest: (...args) => calls.push({ adapter: "json", args }),
});

function dispatch(method, pathname) {
  calls.length = 0;
  const req = { method, url: pathname, headers: {} };
  const res = {};
  const handled = calendarService.handleRequest(req, res, new URL(pathname, "http://localhost"));
  return { handled, call: calls[0] };
}

let result = dispatch("GET", "/api/real/schedules");
assert.equal(result.handled, true);
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/schedules");

result = dispatch("POST", "/api/real/schedules");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/schedules");
assert.equal(result.call.args[3], "POST");

result = dispatch("PATCH", "/api/real/schedules/schedule%201");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/schedules/schedule%201");
assert.equal(result.call.args[3], "PATCH");

result = dispatch("POST", "/api/real/schedules/schedule_1/trigger");
assert.equal(result.call.args[2], "/schedules/schedule_1/trigger");

result = dispatch("GET", "/api/real/projects/project%201/schedules");
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/projects/project%201/schedules");

result = dispatch("POST", "/api/real/projects/project_1/schedules");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/schedules");

result = dispatch("DELETE", "/api/real/projects/project_1/schedules/schedule_1");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/schedules/schedule_1");
assert.equal(result.call.args[3], "DELETE");

result = dispatch("GET", "/api/real/projects/project_1");
assert.equal(result.handled, false);
assert.equal(result.call, undefined);

assert.throws(
  () => createCalendarService({ proxyUpstreamJsonRequest() {} }),
  /proxyUpstreamGet adapter/,
);
assert.throws(
  () => createCalendarService({ proxyUpstreamGet() {} }),
  /proxyUpstreamJsonRequest adapter/,
);

console.log("Calendar service module, composition, and route contracts passed.");

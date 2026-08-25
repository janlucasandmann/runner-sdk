import assert from "node:assert/strict";

import { PROJECTS_DATA_03_FRAGMENT } from "../page/data/03-project-persistence.mjs";
import { PROJECTS_SHELL_01_FRAGMENT } from "../page/shell/01-state-and-loading.mjs";
import { PROJECTS_CORE_CSS_01_FRAGMENT } from "../styles/core/01-page-and-navigation.mjs";
import { PROJECTS_VIEWS_04_FRAGMENT } from "../page/views/04-task-detail-and-modals.mjs";

assert.match(
  PROJECTS_SHELL_01_FRAGMENT,
  /taskActivityVisibleEventCount[\s\S]*?useState\(20\)/,
  "Ticket activity must initially expose at most 20 timeline events.",
);
assert.match(
  PROJECTS_SHELL_01_FRAGMENT,
  /timeline\.getBoundingClientRect\(\)\.bottom[\s\S]*?setTaskActivityVisibleEventCount\(\(current\) => current \+ 10\)/,
  "Ticket activity must reveal ten more events at the captured scroll boundary.",
);
assert.match(
  PROJECTS_DATA_03_FRAGMENT,
  /setTaskActivityTimelineState[\s\S]*?status: "loading"[\s\S]*?applyRefreshedTaskDetails[\s\S]*?status: "ready"/,
  "Ticket activity must become ready only after canonical task details and activity are applied.",
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /renderedActivityTaskId !== selectedActivityTaskId[\s\S]*?message: "Loading ticket activity\.\.\."/,
  "Ticket navigation must not flash activity retained from the previously selected ticket.",
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /renderableActivityItems\.slice\([\s\S]*?Math\.max\(20, taskActivityVisibleEventCount\)/,
  "Ticket activity must progressively slice the centralized normalized timeline.",
);
assert.match(
  PROJECTS_VIEWS_04_FRAGMENT,
  /message: "Loading more activity\.\.\."/,
  "Ticket activity must show the centralized loading label between timeline batches.",
);
assert.match(
  PROJECTS_CORE_CSS_01_FRAGMENT,
  /\.playground-tasks-activity__incremental-loading\s*\{[\s\S]*?min-height: 52px;/,
  "The incremental loading label must reserve stable space at the ticket timeline bottom.",
);

console.log("Ticket activity progressive loading checks passed.");

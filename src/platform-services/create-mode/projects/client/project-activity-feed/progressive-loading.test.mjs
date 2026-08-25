import assert from "node:assert/strict";

import { PROJECT_ACTIVITY_FEED_RUNTIME_FRAGMENT } from "./runtime.mjs";
import { PROJECT_ACTIVITY_FEED_CSS_FRAGMENT } from "./styles.mjs";
import { PROJECTS_SHELL_01_FRAGMENT } from "../page/shell/01-state-and-loading.mjs";

assert.match(
  PROJECTS_SHELL_01_FRAGMENT,
  /projectActivityVisibleEventCount[\s\S]*?useState\(20\)/,
  "Project activity must initially expose at most 20 timeline events.",
);
assert.match(
  PROJECTS_SHELL_01_FRAGMENT,
  /feed\.getBoundingClientRect\(\)\.bottom[\s\S]*?setProjectActivityVisibleEventCount\(\(current\) => current \+ 10\)/,
  "Project activity must reveal ten more events at the page scroll boundary.",
);
assert.match(
  PROJECT_ACTIVITY_FEED_RUNTIME_FRAGMENT,
  /\["idle", "loading"\][\s\S]*?message: "Loading project activity\.\.\."/,
  "Project activity must remain atomically hidden behind the initial loading state.",
);
assert.match(
  PROJECT_ACTIVITY_FEED_RUNTIME_FRAGMENT,
  /activityStateProjectId !== currentProjectId[\s\S]*?message: "Loading project activity\.\.\."/,
  "Project navigation must not flash activity retained from the previously selected project.",
);
assert.match(
  PROJECT_ACTIVITY_FEED_RUNTIME_FRAGMENT,
  /events\.slice\(0, Math\.max\(20, projectActivityVisibleEventCount\)\)/,
  "Project activity must progressively slice the derived timeline.",
);
assert.match(
  PROJECT_ACTIVITY_FEED_RUNTIME_FRAGMENT,
  /message: "Loading more activity\.\.\."/,
  "Project activity must show the centralized loading label between timeline batches.",
);
assert.match(
  PROJECT_ACTIVITY_FEED_CSS_FRAGMENT,
  /\.playground-project-activity-feed__incremental-loading\s*\{[\s\S]*?min-height: 52px;/,
  "The incremental loading label must reserve stable space at the timeline bottom.",
);

console.log("Project activity progressive loading checks passed.");

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const boardViewSource = await readFile(
  new URL("../page/views/03-overview-and-task-previews.mjs", import.meta.url),
  "utf8",
);
const platformStyles = await readFile(
  new URL(
    "../../../../../../apps/platform/client/legacy/templates/platform.template.css",
    import.meta.url,
  ),
  "utf8",
);

test("Backlog board renders only lanes containing visible tickets", () => {
  assert.match(
    boardViewSource,
    /const visibleBoardLanes = PLAYGROUND_TASK_BOARD_LANES\.filter\(\(lane\) =>[\s\S]*?boardTasks\.some\(\(task\) => lane\.statuses\.includes\(getTaskBoardStatus\(task\)\)\)/,
  );
  assert.match(
    boardViewSource,
    /visibleBoardLanes\.map\(\(lane\) => renderBoardReleaseLane\(section, lane\)\)/,
  );
  assert.match(
    boardViewSource,
    /const shouldRenderBoardSections = visibleBoardLanes\.length > 0/,
  );
});

test("Backlog board grid follows the number of populated lanes", () => {
  assert.match(
    boardViewSource,
    /"--playground-tasks-board-column-count": String\(visibleBoardLanes\.length\)/,
  );
  assert.match(
    platformStyles,
    /grid-template-columns: repeat\(var\(--playground-tasks-board-column-count, 5\), minmax\(150px, 1fr\)\)/,
  );
});

test("Backlog board column titles use the centralized ticket status glyph", () => {
  assert.match(
    boardViewSource,
    /playground-tasks-board-release-box-title[\s\S]*?renderPlaygroundTaskStatusGlyph\([\s\S]*?lane\.id,[\s\S]*?playground-tasks-board-release-box-status-icon[\s\S]*?lane\.label/,
  );
  assert.match(
    platformStyles,
    /\.playground-tasks-board-release-box-status-icon\s*\{[\s\S]*?width: 14px;[\s\S]*?height: 14px;/,
  );
});

test("Backlog ticket rows use the same task-color surfaces as board cards", () => {
  assert.match(
    platformStyles,
    /\.playground-tasks-project-workspace \.playground-tasks-backlog-view \.playground-tasks-backlog-item\s*\{[\s\S]*?border-color: rgba\(255, 255, 255, 0\.075\);[\s\S]*?background: var\(--playground-task-color-surface, rgba\(255, 255, 255, 0\.075\)\);/,
  );
  assert.match(
    platformStyles,
    /\.playground-tasks-project-workspace \.playground-tasks-backlog-view \.playground-tasks-backlog-item:hover\s*\{[\s\S]*?background: var\(--playground-task-color-surface-hover, rgba\(255, 255, 255, 0\.1\)\);/,
  );
  assert.match(
    platformStyles,
    /\.playground-tasks-project-workspace \.playground-tasks-backlog-view \.playground-tasks-backlog-item\.is-active\s*\{[\s\S]*?background: var\(--playground-task-color-surface-active, rgba\(255, 255, 255, 0\.1\)\);/,
  );
});

import assert from "node:assert/strict";
import test from "node:test";

import { PROJECTS_VIEWS_02_FRAGMENT } from "../page/views/02-project-details-and-calendar.mjs";
import { PROJECTS_VIEWS_03_FRAGMENT } from "../page/views/03-overview-and-task-previews.mjs";

test("backlog ticket rows open details on primary activation and reserve menus for context click", () => {
  const backlogRowStart = PROJECTS_VIEWS_02_FRAGMENT.indexOf("function renderBacklogTaskRow");
  const backlogRowEnd = PROJECTS_VIEWS_02_FRAGMENT.indexOf("return React.createElement(React.Fragment", backlogRowStart);
  const backlogRowSource = PROJECTS_VIEWS_02_FRAGMENT.slice(backlogRowStart, backlogRowEnd);

  assert.ok(backlogRowStart >= 0 && backlogRowEnd > backlogRowStart);
  assert.match(backlogRowSource, /ticketActionMenu:[\s\S]*?onClick: \(\) => openProjectTaskDetailScreen\(task\.id\)/);
  assert.match(backlogRowSource, /onKeyDown: \(event\)[\s\S]*?openProjectTaskDetailScreen\(task\.id\)/);
  assert.doesNotMatch(backlogRowSource, /openTicketActionMenuOnClick/);
  assert.doesNotMatch(backlogRowSource, /onTicketActionMenuOpen/);
});

test("opening a ticket preview context menu never selects the ticket or changes header state", () => {
  assert.doesNotMatch(PROJECTS_VIEWS_02_FRAGMENT, /onTicketActionMenuOpen:\s*\(\) => handleSelectTask/);
  assert.doesNotMatch(PROJECTS_VIEWS_03_FRAGMENT, /onTicketActionMenuOpen:\s*\(\) => handleSelectTask/);
});

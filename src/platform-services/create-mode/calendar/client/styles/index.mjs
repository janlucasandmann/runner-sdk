import { CALENDAR_WELCOME_WIDGET_CSS } from "./welcome-widget.mjs";
import { CALENDAR_STANDALONE_CONTEXT_CSS } from "./standalone-context.mjs";
import { CALENDAR_STANDALONE_SURFACE_CSS } from "./standalone-surface.mjs";
import { CALENDAR_TOOLBAR_LAYOUT_CSS } from "./toolbar-layout.mjs";
import { CALENDAR_TOOLBAR_MAIN_CSS } from "./toolbar-main.mjs";
import { CALENDAR_TOOLBAR_ACTIONS_CSS } from "./toolbar-actions.mjs";
import { CALENDAR_SCHEDULER_CSS } from "./scheduler.mjs";
import { CALENDAR_LEGACY_GRID_CSS } from "./legacy-grid.mjs";

export const CALENDAR_STYLE_FRAGMENTS = Object.freeze({
  welcomeWidget: CALENDAR_WELCOME_WIDGET_CSS,
  // Positional legacy CSS composition still reserves this retired plan-gate slot.
  upgrade: "",
  standaloneContext: CALENDAR_STANDALONE_CONTEXT_CSS,
  standaloneSurface: CALENDAR_STANDALONE_SURFACE_CSS,
  toolbarLayout: CALENDAR_TOOLBAR_LAYOUT_CSS,
  toolbarMain: CALENDAR_TOOLBAR_MAIN_CSS,
  toolbarActions: CALENDAR_TOOLBAR_ACTIONS_CSS,
  scheduler: CALENDAR_SCHEDULER_CSS,
  legacyGrid: CALENDAR_LEGACY_GRID_CSS,
});

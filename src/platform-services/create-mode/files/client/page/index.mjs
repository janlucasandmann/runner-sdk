import { FILES_PAGE_BROWSER_VIEW_SCRIPT } from "./browser-view.mjs";
import { FILES_PAGE_DIALOGS_SCRIPT } from "./dialogs.mjs";
import { FILES_PAGE_ENTRY_VIEWS_SCRIPT } from "./entry-views.mjs";
import { FILES_PAGE_FILESYSTEM_ACTIONS_SCRIPT } from "./filesystem-actions.mjs";
import { FILES_IMAGE_OVERLAYS_SCRIPT } from "./image-overlays.mjs";
import { FILES_PAGE_PREVIEW_ACTIONS_SCRIPT } from "./preview-actions.mjs";
import { FILES_PAGE_SHARING_ACTIONS_SCRIPT } from "./sharing-actions.mjs";
import { FILES_PAGE_SHELL_SCRIPT } from "./shell.mjs";
import { FILES_PAGE_WORKSPACE_SCRIPT } from "./workspace.mjs";

/** Complete Files page runtime in its original evaluation order. */
export const FILES_PAGE_RUNTIME_SCRIPT = [
  FILES_IMAGE_OVERLAYS_SCRIPT,
  FILES_PAGE_SHELL_SCRIPT,
  FILES_PAGE_WORKSPACE_SCRIPT,
  FILES_PAGE_PREVIEW_ACTIONS_SCRIPT,
  FILES_PAGE_SHARING_ACTIONS_SCRIPT,
  FILES_PAGE_FILESYSTEM_ACTIONS_SCRIPT,
  FILES_PAGE_ENTRY_VIEWS_SCRIPT,
  FILES_PAGE_DIALOGS_SCRIPT,
  FILES_PAGE_BROWSER_VIEW_SCRIPT,
].join("\n");


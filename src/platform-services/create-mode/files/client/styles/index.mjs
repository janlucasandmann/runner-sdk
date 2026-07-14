import { FILES_CHAT_CSS } from "./chat.mjs";
import { FILES_CONTENT_CSS } from "./content.mjs";
import { FILES_CONTEXT_MENU_CSS } from "./context-menu.mjs";
import { FILES_EDITOR_CSS } from "./editor.mjs";
import { FILES_FOUNDATION_CSS } from "./foundation.mjs";
import { FILES_PREVIEW_CSS } from "./preview.mjs";
import { FILES_TOOLBAR_CSS } from "./toolbar.mjs";

export const FILES_STYLE_FRAGMENTS = Object.freeze({
  foundation: FILES_FOUNDATION_CSS,
  toolbar: FILES_TOOLBAR_CSS,
  content: FILES_CONTENT_CSS,
  preview: FILES_PREVIEW_CSS,
  chat: FILES_CHAT_CSS,
  editor: FILES_EDITOR_CSS,
  contextMenu: FILES_CONTEXT_MENU_CSS,
});

export const FILES_PAGE_CSS = Object.values(FILES_STYLE_FRAGMENTS).join("\n");


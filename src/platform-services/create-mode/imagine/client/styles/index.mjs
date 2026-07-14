export {
  IMAGINE_PAGE_CSS,
  IMAGINE_PAGE_CSS_FRAGMENTS,
} from "./page/index.mjs";
export { IMAGINE_SHELL_TOOLBAR_CSS } from "./shell-toolbar.mjs";
export {
  IMAGINE_TEMPLATE_PAGE_CSS,
  IMAGINE_TEMPLATE_PAGE_CSS_FRAGMENTS,
} from "./template-page/index.mjs";

import { IMAGINE_SHELL_TOOLBAR_CSS } from "./shell-toolbar.mjs";

/** Imagine styles mounted in host-owned shared UI locations. */
export const IMAGINE_SHELL_STYLE_FRAGMENTS = Object.freeze({
  toolbar: IMAGINE_SHELL_TOOLBAR_CSS,
});

import { IMAGINE_PAGE_FOUNDATION_CSS } from "./foundation.mjs";
import { IMAGINE_PAGE_GALLERY_CSS } from "./gallery.mjs";
import { IMAGINE_PAGE_TEMPLATE_EDITOR_CSS } from "./template-editor.mjs";
import { IMAGINE_PAGE_COMPOSER_CSS } from "./composer.mjs";
import { IMAGINE_PAGE_TOP_NAVIGATION_CSS } from "./top-navigation.mjs";

export const IMAGINE_PAGE_CSS_FRAGMENTS = Object.freeze({
  foundation: IMAGINE_PAGE_FOUNDATION_CSS,
  gallery: IMAGINE_PAGE_GALLERY_CSS,
  templateEditor: IMAGINE_PAGE_TEMPLATE_EDITOR_CSS,
  composer: IMAGINE_PAGE_COMPOSER_CSS,
  topNavigation: IMAGINE_PAGE_TOP_NAVIGATION_CSS,
});

export const IMAGINE_PAGE_CSS = [
  IMAGINE_PAGE_FOUNDATION_CSS,
  IMAGINE_PAGE_GALLERY_CSS,
  IMAGINE_PAGE_TEMPLATE_EDITOR_CSS,
  IMAGINE_PAGE_COMPOSER_CSS,
  IMAGINE_PAGE_TOP_NAVIGATION_CSS,
].join("");

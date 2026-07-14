import { IMAGINE_APP_LIFECYCLE_SCRIPT } from "./lifecycle.mjs";
import { IMAGINE_APP_NAVIGATION_SCRIPT } from "./navigation.mjs";
import { IMAGINE_APP_SIDEBAR_ENTRY_SCRIPT } from "./sidebar-entry.mjs";
import { IMAGINE_APP_STATE_SCRIPT } from "./state.mjs";
import {
  IMAGINE_APP_TEAM_RESOURCE_NAVIGATION_SCRIPT,
  IMAGINE_APP_TEAM_TEMPLATE_READER_SCRIPT,
} from "./team-integration.mjs";
import { IMAGINE_APP_TOP_NAVIGATION_SCRIPT } from "./top-navigation.mjs";

/** Imagine-owned fragments mounted inside the shared demo application shell. */
export const IMAGINE_APP_SCRIPT_FRAGMENTS = Object.freeze({
  state: IMAGINE_APP_STATE_SCRIPT,
  teamTemplateReader: IMAGINE_APP_TEAM_TEMPLATE_READER_SCRIPT,
  lifecycle: IMAGINE_APP_LIFECYCLE_SCRIPT,
  navigation: IMAGINE_APP_NAVIGATION_SCRIPT,
  teamResourceNavigation: IMAGINE_APP_TEAM_RESOURCE_NAVIGATION_SCRIPT,
  topNavigation: IMAGINE_APP_TOP_NAVIGATION_SCRIPT,
  sidebarEntry: IMAGINE_APP_SIDEBAR_ENTRY_SCRIPT,
});

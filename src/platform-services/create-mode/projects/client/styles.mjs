import { PROJECT_OVERVIEW_CSS } from "./overview/index.mjs";
import { PROJECTS_CONNECTOR_BROWSER_CSS } from "./styles/connector-browser.mjs";
import { PROJECTS_CORE_CSS } from "./styles/core.mjs";
import { PROJECT_DELIVERY_WORKSPACE_CSS } from "./delivery/styles.mjs";

/**
 * Project-owned styles injected into the demo application's shared stylesheet.
 *
 * The demo is still delivered as one HTML document, so the service exposes CSS
 * as a compiled fragment instead of mutating the document at runtime.
 */
export const PROJECTS_STYLE_FRAGMENTS = Object.freeze({
  connectorBrowser: PROJECTS_CONNECTOR_BROWSER_CSS,
  core: PROJECTS_CORE_CSS,
  delivery: PROJECT_DELIVERY_WORKSPACE_CSS,
  overview: PROJECT_OVERVIEW_CSS,
});

/** Complete stylesheet for consumers that do not need legacy cascade slots. */
export const PROJECTS_STYLES = Object.values(PROJECTS_STYLE_FRAGMENTS).join("\n");

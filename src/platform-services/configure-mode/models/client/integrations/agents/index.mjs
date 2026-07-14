import { MODELS_AGENT_CATALOG_LIFECYCLE_SCRIPT } from "./catalog-lifecycle.mjs";
import { MODELS_AGENT_CATALOG_LOADER_SCRIPT } from "./catalog-loader.mjs";
import { MODELS_AGENT_CATALOG_STATE_SCRIPT } from "./catalog-state.mjs";
import { MODELS_AGENT_HOST_PROPS_SCRIPT } from "./host-props.mjs";
import { MODELS_AGENT_OVERVIEW_ACTION_SCRIPT } from "./overview-action.mjs";
import { MODELS_AGENT_PROPS_SCRIPT } from "./props.mjs";
import { MODELS_AGENT_RESOLVED_CATALOG_SCRIPT } from "./resolved-catalog.mjs";

export const MODELS_AGENT_SCRIPT_FRAGMENTS = Object.freeze({
  catalogState: MODELS_AGENT_CATALOG_STATE_SCRIPT,
  resolvedCatalog: MODELS_AGENT_RESOLVED_CATALOG_SCRIPT,
  catalogLoader: MODELS_AGENT_CATALOG_LOADER_SCRIPT,
  catalogLifecycle: MODELS_AGENT_CATALOG_LIFECYCLE_SCRIPT,
  props: MODELS_AGENT_PROPS_SCRIPT,
  overviewAction: MODELS_AGENT_OVERVIEW_ACTION_SCRIPT,
  hostProps: MODELS_AGENT_HOST_PROPS_SCRIPT,
});

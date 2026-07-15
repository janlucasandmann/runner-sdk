import { DEVELOP_HOME_METRICS_LIFECYCLE_SCRIPT } from "./home-lifecycle.mjs";
import { DEVELOP_HOME_OPERATIONAL_METRICS_SCRIPT } from "./operational-metrics.mjs";
import { DEVELOP_RESOURCE_METRICS_LIFECYCLE_SCRIPT } from "./resource-lifecycle.mjs";

export const DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS = Object.freeze({
  operationalMetrics: DEVELOP_HOME_OPERATIONAL_METRICS_SCRIPT,
  homeMetricsLifecycle: DEVELOP_HOME_METRICS_LIFECYCLE_SCRIPT,
  resourceMetricsLifecycle: DEVELOP_RESOURCE_METRICS_LIFECYCLE_SCRIPT,
});

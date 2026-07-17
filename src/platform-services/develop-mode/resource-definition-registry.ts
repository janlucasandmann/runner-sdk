import { AGENT_RUNTIME_RESOURCE_DEFINITION } from "./agent-runtime/index.js";
import { APIS_RESOURCE_DEFINITION } from "./apis/index.js";
import { AUTHENTICATION_RESOURCE_DEFINITION } from "./authentication/index.js";
import { DATABASES_RESOURCE_DEFINITION } from "./databases/index.js";
import { FUNCTIONS_RESOURCE_DEFINITION } from "./functions/index.js";
import { PAYMENTS_RESOURCE_DEFINITION } from "./payments/index.js";
import { SECRETS_RESOURCE_DEFINITION } from "./secrets/index.js";
import {
  createDevelopResourceOverviewAnalyticsModel,
  normalizeDevelopResourceOverviewRows,
  type DevelopResourceDateFormatters,
  type DevelopResourceDefinition,
  type DevelopResourceKind,
  type DevelopResourceOperationalMetrics,
  type DevelopResourceOverviewAnalyticsOptions,
} from "./shared/index.js";
import { VOICE_AGENTS_RESOURCE_DEFINITION } from "./voice-agents/index.js";
import { WEB_APPS_RESOURCE_DEFINITION } from "./web-apps/index.js";

const DEVELOP_RESOURCE_DEFINITIONS: Record<
  DevelopResourceKind,
  DevelopResourceDefinition
> = Object.freeze({
  web_app: WEB_APPS_RESOURCE_DEFINITION,
  api: APIS_RESOURCE_DEFINITION,
  function: FUNCTIONS_RESOURCE_DEFINITION,
  database: DATABASES_RESOURCE_DEFINITION,
  auth: AUTHENTICATION_RESOURCE_DEFINITION,
  agent_runtime: AGENT_RUNTIME_RESOURCE_DEFINITION,
  voice_agent: VOICE_AGENTS_RESOURCE_DEFINITION,
  secrets: SECRETS_RESOURCE_DEFINITION,
  payments: PAYMENTS_RESOURCE_DEFINITION,
});

export const DEVELOP_RESOURCE_KINDS = Object.freeze(
  Object.keys(DEVELOP_RESOURCE_DEFINITIONS) as DevelopResourceKind[],
);

export function isDevelopResourceKind(value: unknown): value is DevelopResourceKind {
  return typeof value === "string"
    && Object.prototype.hasOwnProperty.call(DEVELOP_RESOURCE_DEFINITIONS, value);
}

export function getDevelopResourceDefinition(
  kind: DevelopResourceKind,
): DevelopResourceDefinition {
  return DEVELOP_RESOURCE_DEFINITIONS[kind];
}

export function getDevelopResourceIcon(kind: DevelopResourceKind) {
  return getDevelopResourceDefinition(kind).icon;
}

export function createDevelopResourceOverviewRows(
  records: readonly unknown[],
  kind: DevelopResourceKind,
  formatters: DevelopResourceDateFormatters = {},
) {
  return normalizeDevelopResourceOverviewRows(
    records,
    getDevelopResourceDefinition(kind),
    formatters,
  );
}

export function createDevelopResourceOverviewAnalytics(
  kind: DevelopResourceKind,
  metrics: DevelopResourceOperationalMetrics | null | undefined,
  options: DevelopResourceOverviewAnalyticsOptions = {},
) {
  return createDevelopResourceOverviewAnalyticsModel(
    getDevelopResourceDefinition(kind),
    metrics,
    options,
  );
}

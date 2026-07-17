import type { ComponentType } from "react";
import {
  AGENT_RUNTIME_RESOURCE_DEFINITION,
  DevelopAgentRuntimeOverviewPage,
} from "./agent-runtime/index.js";
import { APIS_RESOURCE_DEFINITION, DevelopApisOverviewPage } from "./apis/index.js";
import {
  AUTHENTICATION_RESOURCE_DEFINITION,
  DevelopAuthenticationOverviewPage,
} from "./authentication/index.js";
import {
  DATABASES_RESOURCE_DEFINITION,
  DevelopDatabasesOverviewPage,
} from "./databases/index.js";
import {
  FUNCTIONS_RESOURCE_DEFINITION,
  DevelopFunctionsOverviewPage,
} from "./functions/index.js";
import {
  PAYMENTS_RESOURCE_DEFINITION,
  DevelopPaymentsOverviewPage,
} from "./payments/index.js";
import {
  SECRETS_RESOURCE_DEFINITION,
  DevelopSecretsOverviewPage,
} from "./secrets/index.js";
import type {
  DevelopResourceDefinition,
  DevelopResourceKind,
  DevelopResourceOverviewRouteProps,
  DevelopResourceOverviewServicePageProps,
} from "./shared/index.js";
import {
  WEB_APPS_RESOURCE_DEFINITION,
  DevelopWebAppsOverviewPage,
} from "./web-apps/index.js";

type StandardDevelopResourceKind = Exclude<DevelopResourceKind, "voice_agent">;

interface StandardDevelopResourceService {
  definition: DevelopResourceDefinition;
  OverviewPage: ComponentType<DevelopResourceOverviewServicePageProps>;
}

const STANDARD_DEVELOP_RESOURCE_SERVICES: Record<
  StandardDevelopResourceKind,
  StandardDevelopResourceService
> = Object.freeze({
  web_app: {
    definition: WEB_APPS_RESOURCE_DEFINITION,
    OverviewPage: DevelopWebAppsOverviewPage,
  },
  api: {
    definition: APIS_RESOURCE_DEFINITION,
    OverviewPage: DevelopApisOverviewPage,
  },
  function: {
    definition: FUNCTIONS_RESOURCE_DEFINITION,
    OverviewPage: DevelopFunctionsOverviewPage,
  },
  database: {
    definition: DATABASES_RESOURCE_DEFINITION,
    OverviewPage: DevelopDatabasesOverviewPage,
  },
  auth: {
    definition: AUTHENTICATION_RESOURCE_DEFINITION,
    OverviewPage: DevelopAuthenticationOverviewPage,
  },
  agent_runtime: {
    definition: AGENT_RUNTIME_RESOURCE_DEFINITION,
    OverviewPage: DevelopAgentRuntimeOverviewPage,
  },
  secrets: {
    definition: SECRETS_RESOURCE_DEFINITION,
    OverviewPage: DevelopSecretsOverviewPage,
  },
  payments: {
    definition: PAYMENTS_RESOURCE_DEFINITION,
    OverviewPage: DevelopPaymentsOverviewPage,
  },
});

export function DevelopResourceOverviewRoute({
  kind,
  ...props
}: DevelopResourceOverviewRouteProps) {
  const service = STANDARD_DEVELOP_RESOURCE_SERVICES[kind];
  if (!service) {
    throw new Error(`No standard overview page is registered for "${kind}".`);
  }
  const OverviewPage = service.OverviewPage;
  return <OverviewPage {...props} />;
}

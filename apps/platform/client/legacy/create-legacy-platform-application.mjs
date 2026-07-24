import {
  CALENDAR_BROWSER_FOUNDATION_FRAGMENTS,
  CALENDAR_SHELL_SCRIPT_FRAGMENTS,
  CALENDAR_STYLE_FRAGMENTS,
  CALENDAR_VENDOR_HEAD_HTML,
} from "../../../../src/platform-services/create-mode/calendar/index.mjs";
import {
  FILES_DOMAIN_FRAGMENTS,
  FILES_PAGE_RUNTIME_SCRIPT,
  FILES_PREVIEW_COMPONENTS_SCRIPT,
  FILES_STYLE_FRAGMENTS,
} from "../../../../src/platform-services/create-mode/files/index.mjs";
import {
  GUARDRAILS_AGENT_SCRIPT_FRAGMENTS,
  GUARDRAILS_APP_SCRIPT_FRAGMENTS,
  GUARDRAILS_DOMAIN_FRAGMENTS,
  GUARDRAILS_PAGE_RUNTIME_SCRIPT,
  GUARDRAILS_STYLE_FRAGMENTS,
} from "../../../../src/platform-services/configure-mode/guardrails/index.mjs";
import {
  ENVIRONMENT_CHANGES_CSS,
  ENVIRONMENT_CHANGES_SCRIPT,
} from "./environment-changes.mjs";
import {
  COMPUTE_RESOURCES_PAGE_SCRIPT,
} from "./domains/compute-resources/source.mjs";
import {
  createAgentsPageScript,
} from "./domains/agents/source.mjs";
import {
  SKILLS_PAGE_SCRIPT,
} from "./domains/skills/source.mjs";
import {
  IMAGINE_APP_SCRIPT_FRAGMENTS,
  IMAGINE_PAGE_CSS,
  IMAGINE_PAGE_SCRIPT,
  IMAGINE_SHELL_STYLE_FRAGMENTS,
  IMAGINE_TEMPLATE_PAGE_CSS,
  IMAGINE_TEMPLATE_PAGE_SCRIPT,
} from "../../../../src/platform-services/create-mode/imagine/index.mjs";
import {
  METRONOME_APP_SCRIPT_FRAGMENTS,
  METRONOME_PAGE_CSS,
  METRONOME_PAGE_SCRIPT,
  METRONOME_SHELL_RUNTIME_SCRIPT,
  METRONOME_SHELL_STYLE_FRAGMENTS,
} from "../../../../src/platform-services/create-mode/metronome/index.mjs";
import {
  MODELS_AGENT_SCRIPT_FRAGMENTS,
  MODELS_PAGE_CSS,
  MODELS_PAGE_SCRIPT,
  createModelsAppScriptFragments,
} from "../../../../src/platform-services/configure-mode/models/index.mjs";
import {
  INFERENCE_APP_SCRIPT_FRAGMENTS,
  INFERENCE_DOMAIN_SCRIPT_FRAGMENTS,
  INFERENCE_PAGE_CASE_SCRIPT,
  INFERENCE_PAGE_CSS,
} from "../../../../src/platform-services/configure-mode/inference/index.mjs";
import {
  TEAMS_APP_SCRIPT_FRAGMENTS,
  TEAMS_DOMAIN_SCRIPT_FRAGMENTS,
  TEAMS_RUNTIME_SCRIPT_FRAGMENTS,
  TEAMS_STYLE_FRAGMENTS,
  createTeamsPageScriptFragments,
} from "../../../../src/platform-services/configure-mode/teams/index.mjs";
import {
  ORGANIZATIONS_APP_SCRIPT_FRAGMENTS,
  ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS,
  ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS,
  ORGANIZATIONS_STYLE_FRAGMENTS,
  createOrganizationsPageScriptFragments,
} from "../../../../src/platform-services/configure-mode/organizations/index.mjs";
import {
  CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS,
  CONFIGURE_HOME_DOMAIN_SCRIPT_FRAGMENTS,
  CONFIGURE_HOME_RUNTIME_SCRIPT_FRAGMENTS,
  CONFIGURE_HOME_STYLE_FRAGMENTS,
  createConfigureHomePageScriptFragments,
} from "../../../../src/platform-services/configure-mode/configure-home/index.mjs";
import {
  APP_HEADER_STYLE_FRAGMENTS,
  ONBOARDING_APP_SCRIPT_FRAGMENTS,
  ONBOARDING_CSS,
  ONBOARDING_PAGE_SCRIPT,
  PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS,
  RESOURCE_CREATION_APP_SCRIPT_FRAGMENTS,
  SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS,
  SETTINGS_MODAL_CSS,
  createAppHeaderScriptFragments,
  createAppSidebarScriptFragments,
  createAppSidebarStyleFragments,
  createSettingsModalPageScript,
} from "../../../../src/platform-shell/index.mjs";
import {
  DEVELOP_HOME_APP_SCRIPT_FRAGMENTS,
  DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS,
  DEVELOP_HOME_STYLE_FRAGMENTS,
  createDevelopHomePageScript,
} from "../../../../src/platform-services/develop-mode/develop-home/index.mjs";
import {
  API_KEYS_APP_SCRIPT_FRAGMENTS,
  API_KEYS_DOMAIN_SCRIPT_FRAGMENTS,
  API_KEYS_PAGE_SCRIPT_FRAGMENTS,
  API_KEYS_RUNTIME_SCRIPT_FRAGMENTS,
  API_KEYS_STYLE_FRAGMENTS,
} from "../../../../src/platform-services/develop-mode/api-keys/index.mjs";
import {
  SECURITY_APP_SCRIPT_FRAGMENTS,
} from "../../../../src/platform-services/develop-mode/security/index.mjs";
import {
  PLATFORM_UI_PRIMITIVES_CSS,
  PLATFORM_UI_PRIMITIVES_SCRIPT,
} from "./platform-ui-primitives.mjs";
import {
  PROJECTS_DOMAIN_FOUNDATION_SCRIPT,
  PROJECTS_DOMAIN_RUNTIME_SCRIPT,
  PROJECTS_INTEGRATIONS_RUNTIME_SCRIPT,
  PROJECTS_PAGE_RUNTIME_SCRIPT,
  PROJECTS_STYLE_FRAGMENTS,
} from "../../../../src/platform-services/create-mode/projects/index.mjs";
import {
  MARKETPLACE_APP_SCRIPT_FRAGMENTS,
  MARKETPLACE_PAGE_CSS,
  MARKETPLACE_PAGE_SCRIPT,
  createMarketplaceDomainScriptFragments,
} from "../../../../src/platform-services/configure-mode/marketplace/index.mjs";
import {
  VERSIONING_CORE_SCRIPT,
} from "./versioning-core.mjs";
import {
  VERSION_SIDEBAR_SCRIPT,
} from "./version-sidebar.mjs";
import {
  EVALUATIONS_AGENT_SCRIPT_FRAGMENTS,
  EVALUATIONS_AGENT_STYLE_FRAGMENTS,
  EVALUATIONS_APP_SCRIPT_FRAGMENTS,
  PLAYGROUND_EVALUATIONS_CSS,
  PLAYGROUND_EVALUATIONS_SCRIPT,
} from "../../../../src/platform-services/configure-mode/evaluations/index.mjs";
import {
  FINE_TUNING_APP_SCRIPT_FRAGMENTS,
  PLAYGROUND_FINE_TUNING_CSS,
  PLAYGROUND_FINE_TUNING_SCRIPT,
} from "../../../../src/platform-services/configure-mode/fine-tuning/index.mjs";
import {
  PLAYGROUND_BILLING_CATALOG_SCRIPT,
} from "../../shared/billing/playground-billing-catalog.mjs";
import { createLegacyPlatformSources } from "./create-legacy-platform-sources.mjs";

/**
 * Assembles the fragment-based platform browser program. Extracted domain
 * modules are composed through explicit presentation boundaries.
 */
export function createLegacyPlatformApplicationBindings({
  aiosOrigin,
  defaultUpstreamOrigin,
  identityProvider = "firebase",
  platformOrigin,
}) {
  function stringifyForBrowserSource(value) {
    return JSON.stringify(value)
      .replace(/</g, "\\u003C")
      .replace(/\u2028/g, "\\u2028")
      .replace(/\u2029/g, "\\u2029");
  }

  const MODELS_APP_SCRIPT_FRAGMENTS = createModelsAppScriptFragments({
    pricingUrl: aiosOrigin + "/pricing",
    developersUrl: aiosOrigin + "/developers",
  });

  const TEAMS_PAGE_SCRIPT_FRAGMENTS = createTeamsPageScriptFragments({
    documentationUrl: aiosOrigin + "/developers/teams",
  });

  const ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS = createOrganizationsPageScriptFragments({
    documentationUrl: aiosOrigin + "/developers/organizations",
  });

  const CONFIGURE_HOME_PAGE_SCRIPT_FRAGMENTS = createConfigureHomePageScriptFragments({
    pricingUrl: aiosOrigin + "/pricing",
  });

  const DEVELOP_HOME_PAGE_SCRIPT = createDevelopHomePageScript({
    aiosOrigin,
    inferenceEntry: INFERENCE_APP_SCRIPT_FRAGMENTS.configureHomeEntry,
  });

  const SETTINGS_MODAL_PAGE_SCRIPT = createSettingsModalPageScript({
    inferencePageCaseScript: INFERENCE_PAGE_CASE_SCRIPT,
    apiKeysLegacySettingsCase: API_KEYS_PAGE_SCRIPT_FRAGMENTS.legacySettingsCase,
    webhooksDocumentationUrl: aiosOrigin + "/developers/run-and-scale/webhooks",
  });

  const APP_HEADER_APP_SCRIPT_FRAGMENTS = createAppHeaderScriptFragments();

  const APP_SIDEBAR_APP_SCRIPT_FRAGMENTS = createAppSidebarScriptFragments({
    metronomeSidebarEntryScript: METRONOME_APP_SCRIPT_FRAGMENTS.sidebarEntry,
    metronomeRunActionMenuScript: METRONOME_APP_SCRIPT_FRAGMENTS.runActionMenu,
    configurePrimaryEntries: CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS.sidebarEntry + TEAMS_APP_SCRIPT_FRAGMENTS.sidebarEntry + ORGANIZATIONS_APP_SCRIPT_FRAGMENTS.sidebarEntry,
    configureGovernanceEntries: EVALUATIONS_APP_SCRIPT_FRAGMENTS.sidebarEntry + FINE_TUNING_APP_SCRIPT_FRAGMENTS.sidebarEntry + GUARDRAILS_APP_SCRIPT_FRAGMENTS.sidebarEntry,
    configureInfrastructureEntries: MODELS_APP_SCRIPT_FRAGMENTS.sidebarEntry + MARKETPLACE_APP_SCRIPT_FRAGMENTS.sidebarEntry + INFERENCE_APP_SCRIPT_FRAGMENTS.sidebarEntry,
    developPrimaryEntries: DEVELOP_HOME_APP_SCRIPT_FRAGMENTS.sidebarEntry + API_KEYS_APP_SCRIPT_FRAGMENTS.sidebarEntry,
    developAgentServiceEntries: SECURITY_APP_SCRIPT_FRAGMENTS.sidebarEntry,
    createPrimaryEntries: IMAGINE_APP_SCRIPT_FRAGMENTS.sidebarEntry,
  });

  const APP_SIDEBAR_STYLE_FRAGMENTS = createAppSidebarStyleFragments({
    metronomeSidebarCss: METRONOME_SHELL_STYLE_FRAGMENTS.sidebar,
  });

  const MARKETPLACE_DOMAIN_SCRIPT_FRAGMENTS = createMarketplaceDomainScriptFragments({
    serialize: stringifyForBrowserSource,
  });
  const AGENTS_PAGE_SCRIPT = createAgentsPageScript({
    defaultUpstreamOrigin,
    evaluations: EVALUATIONS_AGENT_SCRIPT_FRAGMENTS,
    guardrails: GUARDRAILS_AGENT_SCRIPT_FRAGMENTS,
    models: MODELS_AGENT_SCRIPT_FRAGMENTS,
  });

  return Object.freeze({
    AGENTS_PAGE_SCRIPT,
    API_KEYS_APP_SCRIPT_FRAGMENTS,
    API_KEYS_DOMAIN_SCRIPT_FRAGMENTS,
    API_KEYS_PAGE_SCRIPT_FRAGMENTS,
    API_KEYS_RUNTIME_SCRIPT_FRAGMENTS,
    API_KEYS_STYLE_FRAGMENTS,
    APP_HEADER_APP_SCRIPT_FRAGMENTS,
    APP_HEADER_STYLE_FRAGMENTS,
    APP_SIDEBAR_APP_SCRIPT_FRAGMENTS,
    APP_SIDEBAR_STYLE_FRAGMENTS,
    CALENDAR_BROWSER_FOUNDATION_FRAGMENTS,
    CALENDAR_SHELL_SCRIPT_FRAGMENTS,
    CALENDAR_STYLE_FRAGMENTS,
    CALENDAR_VENDOR_HEAD_HTML,
    CONFIGURE_HOME_APP_SCRIPT_FRAGMENTS,
    CONFIGURE_HOME_DOMAIN_SCRIPT_FRAGMENTS,
    CONFIGURE_HOME_PAGE_SCRIPT_FRAGMENTS,
    CONFIGURE_HOME_RUNTIME_SCRIPT_FRAGMENTS,
    CONFIGURE_HOME_STYLE_FRAGMENTS,
    COMPUTE_RESOURCES_PAGE_SCRIPT,
    DEVELOP_HOME_APP_SCRIPT_FRAGMENTS,
    DEVELOP_HOME_PAGE_SCRIPT,
    DEVELOP_HOME_RUNTIME_SCRIPT_FRAGMENTS,
    DEVELOP_HOME_STYLE_FRAGMENTS,
    ENVIRONMENT_CHANGES_CSS,
    ENVIRONMENT_CHANGES_SCRIPT,
    EVALUATIONS_AGENT_SCRIPT_FRAGMENTS,
    EVALUATIONS_AGENT_STYLE_FRAGMENTS,
    EVALUATIONS_APP_SCRIPT_FRAGMENTS,
    FILES_DOMAIN_FRAGMENTS,
    FILES_PAGE_RUNTIME_SCRIPT,
    FILES_PREVIEW_COMPONENTS_SCRIPT,
    FILES_STYLE_FRAGMENTS,
    FINE_TUNING_APP_SCRIPT_FRAGMENTS,
    GUARDRAILS_AGENT_SCRIPT_FRAGMENTS,
    GUARDRAILS_APP_SCRIPT_FRAGMENTS,
    GUARDRAILS_DOMAIN_FRAGMENTS,
    GUARDRAILS_PAGE_RUNTIME_SCRIPT,
    GUARDRAILS_STYLE_FRAGMENTS,
    IMAGINE_APP_SCRIPT_FRAGMENTS,
    IMAGINE_PAGE_CSS,
    IMAGINE_PAGE_SCRIPT,
    IMAGINE_SHELL_STYLE_FRAGMENTS,
    IMAGINE_TEMPLATE_PAGE_CSS,
    IMAGINE_TEMPLATE_PAGE_SCRIPT,
    INFERENCE_APP_SCRIPT_FRAGMENTS,
    INFERENCE_DOMAIN_SCRIPT_FRAGMENTS,
    INFERENCE_PAGE_CSS,
    MARKETPLACE_APP_SCRIPT_FRAGMENTS,
    MARKETPLACE_DOMAIN_SCRIPT_FRAGMENTS,
    MARKETPLACE_PAGE_CSS,
    MARKETPLACE_PAGE_SCRIPT,
    METRONOME_APP_SCRIPT_FRAGMENTS,
    METRONOME_PAGE_CSS,
    METRONOME_PAGE_SCRIPT,
    METRONOME_SHELL_RUNTIME_SCRIPT,
    METRONOME_SHELL_STYLE_FRAGMENTS,
    MODELS_AGENT_SCRIPT_FRAGMENTS,
    MODELS_APP_SCRIPT_FRAGMENTS,
    MODELS_PAGE_CSS,
    MODELS_PAGE_SCRIPT,
    ORGANIZATIONS_APP_SCRIPT_FRAGMENTS,
    ORGANIZATIONS_DOMAIN_SCRIPT_FRAGMENTS,
    ORGANIZATIONS_PAGE_SCRIPT_FRAGMENTS,
    ORGANIZATIONS_RUNTIME_SCRIPT_FRAGMENTS,
    ORGANIZATIONS_STYLE_FRAGMENTS,
    ONBOARDING_APP_SCRIPT_FRAGMENTS,
    ONBOARDING_CSS,
    ONBOARDING_SCRIPT: ONBOARDING_PAGE_SCRIPT,
    PLATFORM_NAVIGATION_GUARD_APP_SCRIPT_FRAGMENTS,
    PLATFORM_UI_PRIMITIVES_CSS,
    PLATFORM_UI_PRIMITIVES_SCRIPT,
    PLAYGROUND_BILLING_CATALOG_SCRIPT,
    PLAYGROUND_EVALUATIONS_CSS,
    PLAYGROUND_EVALUATIONS_SCRIPT,
    PLAYGROUND_FINE_TUNING_CSS,
    PLAYGROUND_FINE_TUNING_SCRIPT,
    PROJECTS_DOMAIN_FOUNDATION_SCRIPT,
    PROJECTS_DOMAIN_RUNTIME_SCRIPT,
    PROJECTS_INTEGRATIONS_RUNTIME_SCRIPT,
    PROJECTS_PAGE_RUNTIME_SCRIPT,
    PROJECTS_STYLE_FRAGMENTS,
    RESOURCE_CREATION_APP_SCRIPT_FRAGMENTS,
    SETTINGS_MODAL_APP_SCRIPT_FRAGMENTS,
    SETTINGS_MODAL_CSS,
    SETTINGS_MODAL_PAGE_SCRIPT,
    SECURITY_APP_SCRIPT_FRAGMENTS,
    SKILLS_PAGE_SCRIPT,
    TEAMS_APP_SCRIPT_FRAGMENTS,
    TEAMS_DOMAIN_SCRIPT_FRAGMENTS,
    TEAMS_PAGE_SCRIPT_FRAGMENTS,
    TEAMS_RUNTIME_SCRIPT_FRAGMENTS,
    TEAMS_STYLE_FRAGMENTS,
    VERSIONING_CORE_SCRIPT,
    VERSION_SIDEBAR_SCRIPT,
    aiosOrigin,
    defaultUpstreamOrigin,
    identityProvider,
    platformOrigin,
  });
}

export function createLegacyPlatformApplicationSources(config) {
  return createLegacyPlatformSources(
    createLegacyPlatformApplicationBindings(config),
  );
}

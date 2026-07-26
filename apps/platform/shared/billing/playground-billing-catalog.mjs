const FALLBACK_CATALOG = Object.freeze({
  version: "2026-07-14.v2",
  billingAccountScope: "organization",
  plans: [
    {
      id: "sandbox",
      name: "Sandbox",
      audience: "Evaluation",
      description: "Evaluate Computer Agents with a default agent and a constrained cloud computer.",
      price: { monthlyUsd: 0, annualMonthlyUsd: 0, annualTotalUsd: 0, additionalBuilderSeatMonthlyUsd: null, additionalBuilderSeatAnnualMonthlyUsd: null },
      includedUsageUsd: 1,
      includedUsageCadence: "one_time",
      includedBuilderSeats: 1,
      includedOperatorSeats: 1,
      defaultMonthlyOverageLimitUsd: 0,
      selfServe: true,
      entitlements: ["agents.default.use", "computers.cloud.use"],
      features: ["$1 one-time usage credit", "Default agent and files", "One constrained cloud computer", "Run estimates and usage history"],
    },
    {
      id: "builder",
      name: "Builder",
      audience: "Independent builders",
      description: "Build and operate custom agents, projects, workflows, and applications.",
      price: { monthlyUsd: 24, annualMonthlyUsd: 20, annualTotalUsd: 240, additionalBuilderSeatMonthlyUsd: null, additionalBuilderSeatAnnualMonthlyUsd: null },
      includedUsageUsd: 5,
      includedUsageCadence: "monthly",
      includedBuilderSeats: 1,
      includedOperatorSeats: 1,
      defaultMonthlyOverageLimitUsd: 25,
      highlighted: true,
      selfServe: true,
      entitlements: [
        "agents.default.use",
        "agents.custom.create",
        "projects.use",
        "imagine.generate",
        "metronomes.use",
        "tags.use",
        "computers.cloud.use",
        "computers.cloud.create",
        "schedules.use",
        "api.access",
        "evaluations.use",
        "tests.use",
        "guardrails.use",
        "fine_tuning.use",
        "security.repositories.use",
        "servers.deploy",
      ],
      features: ["$5 monthly usage credit", "Custom agents and Projects", "Imagine and Metronome workflows", "Evaluations, guardrails, and fine-tuning", "Cloud computers and developer resources", "Tags, schedules, and API access"],
    },
    {
      id: "team",
      name: "Team",
      audience: "Collaborative teams",
      description: "Share agents and resources across an organization with pooled billing and roles.",
      price: { monthlyUsd: 79, annualMonthlyUsd: 65, annualTotalUsd: 780, additionalBuilderSeatMonthlyUsd: 15, additionalBuilderSeatAnnualMonthlyUsd: 12 },
      includedUsageUsd: 15,
      includedUsageCadence: "monthly",
      includedBuilderSeats: 3,
      includedOperatorSeats: "unlimited",
      defaultMonthlyOverageLimitUsd: 100,
      selfServe: true,
      entitlements: [
        "agents.default.use",
        "agents.custom.create",
        "projects.use",
        "imagine.generate",
        "metronomes.use",
        "tags.use",
        "computers.cloud.use",
        "computers.cloud.create",
        "schedules.use",
        "api.access",
        "evaluations.use",
        "tests.use",
        "guardrails.use",
        "fine_tuning.use",
        "security.repositories.use",
        "servers.deploy",
        "organizations.collaborate",
        "squads.use",
        "billing.pooled",
        "governance.roles",
        "inference.byo",
      ],
      features: ["$15 pooled monthly usage credit", "Three builder seats", "Unlimited operators and viewers", "Shared agents, projects, and computers", "Squads, roles, and pooled billing", "Bring your own inference endpoint"],
    },
    {
      id: "business",
      name: "Business",
      audience: "Governed organizations",
      description: "Add security, policy, identity, and organization-wide analytics for production use.",
      price: { monthlyUsd: 249, annualMonthlyUsd: 209, annualTotalUsd: 2508, additionalBuilderSeatMonthlyUsd: 12, additionalBuilderSeatAnnualMonthlyUsd: 10 },
      includedUsageUsd: 40,
      includedUsageCadence: "monthly",
      includedBuilderSeats: 10,
      includedOperatorSeats: "unlimited",
      defaultMonthlyOverageLimitUsd: 500,
      selfServe: true,
      entitlements: [
        "agents.default.use",
        "agents.custom.create",
        "projects.use",
        "imagine.generate",
        "metronomes.use",
        "tags.use",
        "computers.cloud.use",
        "computers.cloud.create",
        "schedules.use",
        "api.access",
        "evaluations.use",
        "tests.use",
        "guardrails.use",
        "fine_tuning.use",
        "security.repositories.use",
        "servers.deploy",
        "organizations.collaborate",
        "squads.use",
        "billing.pooled",
        "governance.roles",
        "inference.byo",
        "audit_logs.use",
        "governance.approvals",
        "sso.saml",
        "scim.use",
        "service_accounts.use",
        "analytics.organization",
      ],
      features: ["$40 pooled monthly usage credit", "Ten builder seats", "Audit logs and approval policies", "SAML SSO and SCIM", "Service accounts and organization analytics", "Priority support"],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      audience: "Regulated and large organizations",
      description: "Contracted capacity, deployment controls, compliance, and support for critical operations.",
      price: { monthlyUsd: null, annualMonthlyUsd: null, annualTotalUsd: null, additionalBuilderSeatMonthlyUsd: null, additionalBuilderSeatAnnualMonthlyUsd: null },
      includedUsageUsd: 40,
      includedUsageCadence: "commitment",
      includedBuilderSeats: "unlimited",
      includedOperatorSeats: "unlimited",
      defaultMonthlyOverageLimitUsd: 0,
      selfServe: false,
      entitlements: [
        "agents.default.use",
        "agents.custom.create",
        "projects.use",
        "imagine.generate",
        "metronomes.use",
        "tags.use",
        "computers.cloud.use",
        "computers.cloud.create",
        "schedules.use",
        "api.access",
        "evaluations.use",
        "tests.use",
        "guardrails.use",
        "fine_tuning.use",
        "security.repositories.use",
        "servers.deploy",
        "organizations.collaborate",
        "squads.use",
        "billing.pooled",
        "governance.roles",
        "inference.byo",
        "audit_logs.use",
        "governance.approvals",
        "sso.saml",
        "scim.use",
        "service_accounts.use",
        "analytics.organization",
        "private_networking.use",
        "data_residency.configure",
        "support.sla",
      ],
      features: ["Contracted usage commitment", "Private networking and data residency", "Custom retention and dedicated capacity", "Security and architecture review", "SLA and enterprise support"],
    },
  ],
  topUps: [
    { id: "starter", name: "Starter Pack", priceUsd: 10, creditsUsd: 10, description: "A small one-time top-up for quick follow-ups and lighter agent runs." },
    { id: "boost", name: "Boost Pack", priceUsd: 25, creditsUsd: 25, description: "One-time extra budget for short bursts, overages, and deadline weeks." },
    { id: "growth", name: "Growth Pack", priceUsd: 100, creditsUsd: 100, description: "A larger top-up for heavier agent workloads and multi-step automation." },
    { id: "scale", name: "Scale Pack", priceUsd: 250, creditsUsd: 250, description: "High-volume one-time capacity for production spikes and larger pipelines." },
  ],
});

const TIER_ALIASES = Object.freeze({
  sandbox: "sandbox",
  free: "sandbox",
  builder: "builder",
  individual: "builder",
  pro: "builder",
  team: "team",
  scale: "team",
  business: "business",
  enterprise: "enterprise",
  max: "enterprise",
  company: "business",
  corporate: "business",
  organization: "business",
  org: "business",
  enterprise_plan: "enterprise",
});

function inlineJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export const PLAYGROUND_BILLING_CATALOG_SCRIPT = `
      const SETTINGS_BILLING_FALLBACK_CATALOG = Object.freeze(${inlineJson(FALLBACK_CATALOG)});
      const SETTINGS_TIER_USAGE_ICONS = Object.freeze({
        sandbox: Battery,
        builder: BatteryLow,
        team: BatteryMedium,
        business: BatteryFull,
        enterprise: BatteryFull,
      });
      const SETTINGS_TIER_ALIAS_MAP = Object.freeze(${inlineJson(TIER_ALIASES)});

      function normalizeSettingsTierId(value) {
        const normalized = String(value || "").trim().toLowerCase();
        if (!normalized) return "";
        if (normalized === "sandbox" || normalized === "builder" || normalized === "team" || normalized === "business" || normalized === "enterprise") {
          return normalized;
        }
        const normalizedAlias = normalized.replace(/[\\s-]+/g, "_");
        return SETTINGS_TIER_ALIAS_MAP[normalized] || SETTINGS_TIER_ALIAS_MAP[normalizedAlias] || "";
      }

      function formatSubscriptionTier(value) {
        const tierId = normalizeSettingsTierId(value) || "sandbox";
        const plan = SETTINGS_PLAN_CATALOG.find((candidate) => candidate.id === tierId);
        return plan?.name || "Sandbox";
      }

      function mapSettingsBillingPlan(plan) {
        const includedUsageUsd = Math.max(0, Number(plan?.includedUsageUsd) || 0);
        const monthlyPrice = plan?.price?.monthlyUsd == null ? null : Math.max(0, Number(plan.price.monthlyUsd) || 0);
        const yearlyPrice = plan?.price?.annualMonthlyUsd == null ? null : Math.max(0, Number(plan.price.annualMonthlyUsd) || 0);
        return {
          ...plan,
          id: String(plan?.id || "sandbox"),
          name: String(plan?.name || "Sandbox"),
          monthlyPrice,
          yearlyPrice,
          annualTotalUsd: plan?.price?.annualTotalUsd == null ? null : Math.max(0, Number(plan.price.annualTotalUsd) || 0),
          billingLabel: monthlyPrice == null ? "custom" : "/ month",
          includedUsageUsd,
          computeTokens: Math.round(includedUsageUsd * SETTINGS_CT_PER_DOLLAR),
          description: String(plan?.description || ""),
          features: Array.isArray(plan?.features) ? plan.features.map((feature) => String(feature || "")).filter(Boolean) : [],
          entitlements: Array.isArray(plan?.entitlements)
            ? plan.entitlements.map((entitlement) => String(entitlement || "").trim()).filter(Boolean)
            : Object.entries(
                plan?.entitlements && typeof plan.entitlements === "object"
                  ? plan.entitlements
                  : {}
              )
                .filter(([, entitlementValue]) => (
                  entitlementValue === true
                  || entitlementValue === "unlimited"
                  || (typeof entitlementValue === "number" && entitlementValue > 0)
                ))
                .map(([entitlement]) => entitlement),
        };
      }

      function mapSettingsBillingTopUp(topUp) {
        const creditsUsd = Math.max(0, Number(topUp?.creditsUsd) || 0);
        return {
          ...topUp,
          id: String(topUp?.id || ""),
          name: String(topUp?.name || "Credit Pack"),
          price: Math.max(0, Number(topUp?.priceUsd ?? topUp?.price) || 0),
          creditsUsd,
          computeTokens: Math.round(creditsUsd * SETTINGS_CT_PER_DOLLAR),
          description: String(topUp?.description || ""),
        };
      }

      let settingsBillingCatalogVersion = SETTINGS_BILLING_FALLBACK_CATALOG.version;
      let SETTINGS_PLAN_CATALOG = SETTINGS_BILLING_FALLBACK_CATALOG.plans.map(mapSettingsBillingPlan);
      let SETTINGS_TOP_UP_CATALOG = SETTINGS_BILLING_FALLBACK_CATALOG.topUps.map(mapSettingsBillingTopUp);

      function getSettingsPlanById(value) {
        const normalizedTierId = normalizeSettingsTierId(value);
        if (!normalizedTierId) return null;
        return SETTINGS_PLAN_CATALOG.find((plan) => plan.id === normalizedTierId) || null;
      }

      function getSettingsMinimumPlanForEntitlement(value) {
        const entitlement = String(value || "").trim();
        if (!entitlement) return null;
        return SETTINGS_PLAN_CATALOG.find((plan) => (
          Array.isArray(plan?.entitlements) && plan.entitlements.includes(entitlement)
        )) || null;
      }

      function getSettingsPlanFeatures(tierId, computeTokens) {
        const normalizedTierId = normalizeSettingsTierId(tierId) || "sandbox";
        const plan = SETTINGS_PLAN_CATALOG.find((candidate) => candidate.id === normalizedTierId);
        const formattedCredits = formatSettingsComputeTokens(Number(computeTokens || 0));
        const featureIcons = [
          SETTINGS_TIER_USAGE_ICONS[normalizedTierId] || Coins,
          User,
          Layers,
          Shield,
          HardDrive,
          Sparkles,
        ];
        const features = Array.isArray(plan?.features) && plan.features.length > 0
          ? plan.features
          : [formattedCredits + " included credits"];
        return features.map((text, index) => ({ text, icon: featureIcons[index % featureIcons.length] }));
      }

      function getSettingsPlanOptions(currentTierId) {
        const normalizedCurrentTierId = normalizeSettingsTierId(currentTierId) || "sandbox";
        return SETTINGS_PLAN_CATALOG.filter((plan) =>
          plan.id !== "sandbox" || normalizedCurrentTierId === "sandbox"
        );
      }

      function openSettingsContactSales() {
        window.open("https://computer-agents.com/contact-sales", "_blank", "noopener,noreferrer");
      }

      function getSettingsTierLogoUrl(value) {
        const tierId = normalizeSettingsTierId(value);
        if (tierId === "builder") return "/img/logos/proicon.png";
        if (tierId === "team") return "/img/logos/scaleicon.png";
        if (tierId === "business" || tierId === "enterprise") return "/img/logos/maxicon.png";
        return "/img/logos/settingsicon.png";
      }

      async function refreshSettingsBillingCatalog(requestHeaders = {}) {
        const response = await fetch("/api/real/billing/catalog", {
          credentials: "include",
          cache: "no-store",
          headers: requestHeaders,
        });
        if (!response.ok) throw new Error("Unable to load the billing catalog.");
        const payload = await response.json();
        if (!payload || !Array.isArray(payload.plans) || payload.plans.length === 0) {
          throw new Error("The billing catalog response is invalid.");
        }
        settingsBillingCatalogVersion = String(payload.version || settingsBillingCatalogVersion);
        SETTINGS_PLAN_CATALOG = payload.plans.map(mapSettingsBillingPlan);
        if (Array.isArray(payload.topUps) && payload.topUps.length > 0) {
          SETTINGS_TOP_UP_CATALOG = payload.topUps.map(mapSettingsBillingTopUp);
        }
        return {
          version: settingsBillingCatalogVersion,
          plans: SETTINGS_PLAN_CATALOG,
          topUps: SETTINGS_TOP_UP_CATALOG,
        };
      }
`;

const BILLING_PROXY_ROUTES = Object.freeze({
  "GET /api/real/billing/catalog": { method: "GET", upstreamPath: "/billing/catalog" },
  "GET /api/real/billing/organization/plan": { method: "GET", upstreamPath: "/billing/organization/plan" },
  "GET /api/real/billing/organization/summary": { method: "GET", upstreamPath: "/billing/organization/summary" },
  "GET /api/real/billing/budget": { method: "GET", upstreamPath: "/billing/budget" },
  "GET /api/real/billing/preferences": { method: "GET", upstreamPath: "/billing/preferences" },
  "PATCH /api/real/billing/preferences": { method: "PATCH", upstreamPath: "/billing/preferences" },
  "PATCH /api/real/billing/organization/usage-controls": { method: "PATCH", upstreamPath: "/billing/organization/usage-controls" },
});

export function matchPlaygroundBillingProxyRoute(method, pathname) {
  return BILLING_PROXY_ROUTES[`${String(method || "GET").toUpperCase()} ${pathname}`] || null;
}

export const PLAYGROUND_BILLING_FALLBACK_CATALOG = FALLBACK_CATALOG;

export const PLAN_GATE_LIFECYCLE_SCRIPT = String.raw`        const openPlatformPlanGate = useCallback((request = {}) => {
          if (!platformHasCapability("subscriptions")) {
            setPlatformPlanGateRequest(null);
            return;
          }
          const normalizedRequest = request && typeof request === "object"
            ? request
            : {};
          setPlatformPlanGateActionLoading(false);
          setPlatformPlanGateError("");
          setPlatformPlanGateRequest({
            ...normalizedRequest,
            token: String(normalizedRequest.token || (Date.now().toString(36) + Math.random().toString(36).slice(2))),
          });
          setAccountMenuOpen(false);
          setNotificationsOpen(false);
        }, []);

        const closePlatformPlanGate = useCallback(() => {
          if (platformPlanGateActionLoading) {
            return;
          }
          setPlatformPlanGateRequest(null);
          setPlatformPlanGateError("");
        }, [platformPlanGateActionLoading]);

        useEffect(() => {
          return subscribePlatformPlanGateRequests(openPlatformPlanGate);
        }, [openPlatformPlanGate]);

        function getPlatformPlanGateResolvedPlan(request = platformPlanGateRequest) {
          const explicitPlan = getSettingsPlanById(request?.requiredPlan);
          if (explicitPlan) {
            return explicitPlan;
          }
          const entitlementPlan = getSettingsMinimumPlanForEntitlement(request?.entitlement);
          if (entitlementPlan) {
            return entitlementPlan;
          }
          return getSettingsPlanById(request?.mode === "budget" ? settingsCurrentTierId : "builder")
            || getSettingsPlanById("builder")
            || SETTINGS_PLAN_CATALOG[0];
        }

        async function handlePlatformPlanGatePrimaryAction() {
          if (!platformPlanGateRequest || platformPlanGateActionLoading) {
            return;
          }
          const requiredPlan = getPlatformPlanGateResolvedPlan(platformPlanGateRequest);
          if (platformPlanGateRequest.mode === "budget") {
            setPlatformPlanGateRequest(null);
            openOrganizationBillingPage("billing", "costs-plan-options");
            return;
          }
          if (requiredPlan?.selfServe === false) {
            setPlatformPlanGateRequest(null);
            openSettingsContactSales();
            return;
          }

          setPlatformPlanGateActionLoading(true);
          setPlatformPlanGateError("");
          try {
            await Promise.resolve(handleSettingsSubscribe(requiredPlan?.id || "builder"));
          } catch (error) {
            setPlatformPlanGateError(error instanceof Error ? error.message : "Unable to open checkout.");
          } finally {
            setPlatformPlanGateActionLoading(false);
          }
        }

        function handlePlatformPlanGateViewPlans() {
          if (platformPlanGateActionLoading) {
            return;
          }
          setPlatformPlanGateRequest(null);
          setPlatformPlanGateError("");
          openOrganizationBillingPage("billing", "costs-plans");
        }
`;

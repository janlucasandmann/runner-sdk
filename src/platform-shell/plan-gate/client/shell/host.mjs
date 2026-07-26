export const PLAN_GATE_HOST_SCRIPT = String.raw`        function renderPlatformPlanGateHost() {
          if (!platformPlanGateRequest) {
            return null;
          }
          const requiredPlan = getPlatformPlanGateResolvedPlan(platformPlanGateRequest);
          const currentPlan = getSettingsPlanById(settingsCurrentTierId);
          return React.createElement(PlatformPlanGateModal, {
            key: platformPlanGateRequest.token,
            open: true,
            mode: platformPlanGateRequest.mode,
            featureName: platformPlanGateRequest.featureName,
            title: platformPlanGateRequest.title,
            description: platformPlanGateRequest.description || platformPlanGateRequest.message,
            requiredPlan,
            currentPlanName: currentPlan?.name || formatSubscriptionTier(settingsCurrentTierId),
            actionLabel: platformPlanGateRequest.actionLabel,
            actionLoading: platformPlanGateActionLoading,
            error: platformPlanGateError || settingsBillingError,
            onClose: closePlatformPlanGate,
            onPrimaryAction: handlePlatformPlanGatePrimaryAction,
            onViewPlans: handlePlatformPlanGateViewPlans,
          });
        }
`;


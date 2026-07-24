export const ONBOARDING_STEP_IDS = Object.freeze([
  "welcome",
  "computer",
  "agents",
  "connectors",
  "plan",
]);

export function normalizePlaygroundOnboardingStepIndex(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }
  return Math.max(
    0,
    Math.min(ONBOARDING_STEP_IDS.length - 1, Math.round(numericValue)),
  );
}

export function createPlaygroundOnboardingSnapshot(options = {}) {
  return {
    version: 1,
    stepIndex: normalizePlaygroundOnboardingStepIndex(options.stepIndex),
    dismissed: options.dismissed === true,
  };
}

export function normalizePlaygroundOnboardingSnapshot(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return createPlaygroundOnboardingSnapshot();
  }
  return createPlaygroundOnboardingSnapshot(value);
}

export function shouldAutoOpenPlaygroundOnboarding(options = {}) {
  return options.sessionStatus === "authenticated"
    && options.onboardingCompleted === false
    && options.open !== true
    && options.dismissedForSession !== true;
}

const serializedStepIds = JSON.stringify(ONBOARDING_STEP_IDS);

export const ONBOARDING_DOMAIN_SCRIPT = String.raw`
        const PLAYGROUND_ONBOARDING_QUERY_PARAM = "showOnboarding";
        const PLAYGROUND_ONBOARDING_STEP_QUERY_PARAM = "onboardingStep";
        const PLAYGROUND_ONBOARDING_STATE_KEY = "runner_demo_playground_onboarding_v1";
        const ONBOARDING_STEP_IDS = Object.freeze(${serializedStepIds});

        ${normalizePlaygroundOnboardingStepIndex.toString()}

        ${createPlaygroundOnboardingSnapshot.toString()}

        ${normalizePlaygroundOnboardingSnapshot.toString()}

        ${shouldAutoOpenPlaygroundOnboarding.toString()}

        function readPlaygroundOnboardingState() {
          try {
            const raw = sessionStorage.getItem(PLAYGROUND_ONBOARDING_STATE_KEY);
            const parsed = raw ? JSON.parse(raw) : null;
            return normalizePlaygroundOnboardingSnapshot(parsed);
          } catch {
            return createPlaygroundOnboardingSnapshot();
          }
        }

        function writePlaygroundOnboardingState(value) {
          const snapshot = normalizePlaygroundOnboardingSnapshot(value);
          try {
            sessionStorage.setItem(PLAYGROUND_ONBOARDING_STATE_KEY, JSON.stringify(snapshot));
          } catch {}
          return snapshot;
        }

        function clearPlaygroundOnboardingState() {
          try {
            sessionStorage.removeItem(PLAYGROUND_ONBOARDING_STATE_KEY);
          } catch {}
        }
`;


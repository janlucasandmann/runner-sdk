export const ONBOARDING_NAVIGATION_SCRIPT = String.raw`        function removePlaygroundOnboardingSearchParams() {
          removeCurrentSearchParam(PLAYGROUND_ONBOARDING_QUERY_PARAM);
          removeCurrentSearchParam(PLAYGROUND_ONBOARDING_STEP_QUERY_PARAM);
        }

        function openPlaygroundOnboarding(options = {}) {
          const savedSnapshot = readPlaygroundOnboardingState();
          const snapshot = writePlaygroundOnboardingState({
            stepIndex: options.stepIndex == null ? savedSnapshot.stepIndex : options.stepIndex,
            dismissed: false,
          });
          setPlaygroundOnboardingDismissedForSession(false);
          if (options.updateUrl === true) {
            try {
              const url = new URL(window.location.href);
              url.searchParams.set(PLAYGROUND_ONBOARDING_QUERY_PARAM, "true");
              url.searchParams.set(PLAYGROUND_ONBOARDING_STEP_QUERY_PARAM, String(snapshot.stepIndex));
              window.history.replaceState({}, "", url.toString());
            } catch {}
          }
          setShowPlaygroundOnboarding(true);
        }

        function dismissPlaygroundOnboarding(snapshot = {}) {
          writePlaygroundOnboardingState({
            ...snapshot,
            dismissed: true,
          });
          removePlaygroundOnboardingSearchParams();
          setPlaygroundOnboardingDismissedForSession(true);
          setShowPlaygroundOnboarding(false);
        }

        function completePlaygroundOnboarding() {
          clearPlaygroundOnboardingState();
          removePlaygroundOnboardingSearchParams();
          setPlaygroundOnboardingDismissedForSession(false);
          setShowPlaygroundOnboarding(false);
          if (sessionState.status !== "authenticated" || sessionState.onboardingCompleted === true) {
            return;
          }
          setSessionState((current) => ({
            ...current,
            onboardingCompleted: true,
          }));
          void fetchJsonWithTimeout("/api/aios/user/profile", {
            method: "PATCH",
            credentials: "include",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              onboardingCompleted: true,
            }),
          }, 15000).catch(() => {});
        }

        function restorePlaygroundOnboardingFromConnectorRedirect(redirectState) {
          const onboardingContext = redirectState?.onboarding && typeof redirectState.onboarding === "object" && !Array.isArray(redirectState.onboarding)
            ? redirectState.onboarding
            : null;
          if (!onboardingContext) {
            return false;
          }
          openPlaygroundOnboarding({
            stepIndex: onboardingContext.stepIndex,
            updateUrl: true,
          });
          return true;
        }
`;

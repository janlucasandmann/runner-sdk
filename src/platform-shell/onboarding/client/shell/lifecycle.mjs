export const ONBOARDING_LIFECYCLE_SCRIPT = String.raw`        useEffect(() => {
          function syncPlaygroundOnboardingFromUrl() {
            const requestedOpen = readCurrentSearchParam(PLAYGROUND_ONBOARDING_QUERY_PARAM) === "true";
            if (requestedOpen) {
              setPlaygroundOnboardingDismissedForSession(false);
            }
            setShowPlaygroundOnboarding(requestedOpen);
          }

          window.addEventListener("popstate", syncPlaygroundOnboardingFromUrl);
          return () => window.removeEventListener("popstate", syncPlaygroundOnboardingFromUrl);
        }, []);

        useEffect(() => {
          if (!showPlaygroundOnboarding) {
            return;
          }
          setAccountMenuOpen(false);
          setThreadSearchOpen(false);
          setNotificationsOpen(false);
          setProfileEditorOpen(false);
          setThreadActionMenuState(null);
          setThreadNavMenuOpen(false);
          setThreadTaskListMenuOpen(false);
        }, [showPlaygroundOnboarding]);

        useEffect(() => {
          if (!shouldAutoOpenPlaygroundOnboarding({
            sessionStatus: sessionState.status,
            onboardingCompleted: sessionState.onboardingCompleted,
            open: showPlaygroundOnboarding,
            dismissedForSession: playgroundOnboardingDismissedForSession,
          })) {
            return;
          }
          openPlaygroundOnboarding({
            stepIndex: readPlaygroundOnboardingState().stepIndex,
          });
        }, [
          playgroundOnboardingDismissedForSession,
          sessionState.onboardingCompleted,
          sessionState.status,
          showPlaygroundOnboarding,
        ]);
`;


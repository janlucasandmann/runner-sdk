export const ONBOARDING_STATE_SCRIPT = String.raw`        const initialPlaygroundOnboardingSnapshot = readPlaygroundOnboardingState();
        const [showPlaygroundOnboarding, setShowPlaygroundOnboarding] = useState(() => readCurrentSearchParam(PLAYGROUND_ONBOARDING_QUERY_PARAM) === "true");
        const [playgroundOnboardingDismissedForSession, setPlaygroundOnboardingDismissedForSession] = useState(() => (
          readCurrentSearchParam(PLAYGROUND_ONBOARDING_QUERY_PARAM) === "true"
            ? false
            : initialPlaygroundOnboardingSnapshot.dismissed
        ));
`;


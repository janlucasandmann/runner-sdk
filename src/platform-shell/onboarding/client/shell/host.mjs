export const ONBOARDING_HOST_SCRIPT = String.raw`        function renderPlaygroundOnboardingHost() {
          if (!showPlaygroundOnboarding) {
            return null;
          }
          return createPortal(
            React.createElement(PlaygroundOnboardingExperience, {
              open: showPlaygroundOnboarding,
              sessionStatus: sessionState.status,
              hasRealAccess,
              backendUrl: proxyBackendBase,
              requestHeaders,
              defaultEnvironmentId: resolvedEnvironmentId,
              defaultEnvironmentName: resolvedEnvironmentName,
              currentPlanId: settingsCurrentTierId,
              connectorStatuses: {
                github: githubStatus,
                gmail: gmailStatus,
                googleDrive: googleDriveStatus,
                oneDrive: oneDriveStatus,
                notion: notionStatus,
              },
              connectorActions: {
                github: handleGithubAuthConnect,
                gmail: handleGmailAuthConnect,
                googleDrive: handleGoogleDriveAuthConnect,
                oneDrive: handleOneDriveAuthConnect,
                notion: handleNotionAuthConnect,
              },
              onDismiss: dismissPlaygroundOnboarding,
              onComplete: completePlaygroundOnboarding,
              onSignIn: handleSignInWithComputerAgents,
              onUpgradeToIndividual: () => handleSettingsSubscribe("builder"),
            }),
            document.body
          );
        }
`;

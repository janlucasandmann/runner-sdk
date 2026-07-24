export const ONBOARDING_RUNTIME_SCRIPT = String.raw`          const ensureAndWarmOnboardingDefaultEnvironment = useCallback(async function ensureAndWarmOnboardingDefaultEnvironment() {
            if (!hasRealAccess || sessionState.status !== "authenticated" || sessionStreamingConfig.status !== "ready") {
              return;
            }
  
            const sessionWarmKey = JSON.stringify({
              upstreamUrl: resolvedUpstreamUrl,
              userId: sessionState.userId || accountEmail || "current",
              agentId: resolvedPreferredAgentId || null,
            });
            if (onboardingDefaultEnvironmentWarmKeyRef.current === sessionWarmKey) {
              return;
            }
            onboardingDefaultEnvironmentWarmKeyRef.current = sessionWarmKey;
  
            try {
              const response = await fetch(proxyBackendBase + "/environments/default", {
                method: "GET",
                headers: authRequestHeaders,
                credentials: "include",
                cache: "no-store",
              });
  
              if (isUnauthorizedStatus(response.status)) {
                onboardingDefaultEnvironmentWarmKeyRef.current = "";
                triggerPlatformSessionRecovery();
                return;
              }
  
              if (!response.ok) {
                onboardingDefaultEnvironmentWarmKeyRef.current = "";
                return;
              }
  
              const text = await response.text();
              let parsed = {};
              try {
                parsed = text ? JSON.parse(text) : {};
              } catch {
                parsed = {};
              }
  
              const defaultEnvironment = getPlaygroundEnvironmentResponseRecord(parsed);
              const defaultEnvironmentId = String(defaultEnvironment?.id || "").trim();
              if (!defaultEnvironmentId) {
                onboardingDefaultEnvironmentWarmKeyRef.current = "";
                return;
              }
  
              setRealEnvironments((current) => {
                const existing = Array.isArray(current) ? current : [];
                const existingIndex = existing.findIndex((environment) => environment?.id === defaultEnvironmentId);
                if (existingIndex < 0) {
                  return [defaultEnvironment, ...existing];
                }
                return existing.map((environment, index) => (
                  index === existingIndex ? { ...environment, ...defaultEnvironment } : environment
                ));
              });
  
              await proactivelyWarmDefaultEnvironment(defaultEnvironmentId, resolvedPreferredAgentId);
            } catch (error) {
              onboardingDefaultEnvironmentWarmKeyRef.current = "";
              console.warn("[playground] Failed to prewarm onboarding default environment.", error);
            }
          }, [
            accountEmail,
            authRequestHeaders,
            hasRealAccess,
            proactivelyWarmDefaultEnvironment,
            proxyBackendBase,
            resolvedPreferredAgentId,
            resolvedUpstreamUrl,
            sessionState.status,
            sessionState.userId,
            sessionStreamingConfig.status,
            triggerPlatformSessionRecovery,
          ]);
          useEffect(() => {
            const shouldWarmDuringOnboarding =
              hasRealAccess
              && sessionState.status === "authenticated"
              && sessionStreamingConfig.status === "ready"
              && (sessionState.onboardingCompleted === false || showPlaygroundOnboarding);
  
            if (!shouldWarmDuringOnboarding) {
              return undefined;
            }
  
            void ensureAndWarmOnboardingDefaultEnvironment();
            return undefined;
          }, [
            ensureAndWarmOnboardingDefaultEnvironment,
            hasRealAccess,
            sessionState.onboardingCompleted,
            sessionState.status,
            sessionStreamingConfig.status,
            showPlaygroundOnboarding,
          ]);
`;


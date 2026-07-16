export const API_KEYS_LOAD_LIFECYCLE_SCRIPT = `        useEffect(() => {
          if (!hasSessionAuth) {
            return;
          }

          if (activePage === "develop" || activePage === "develop-api-keys") {
            void loadSettingsApiKeys();
          }
          if (activePage === "develop-webhooks") {
            void loadSettingsTriggers();
          }
        }, [
          activePage,
          hasSessionAuth,
	          loadSettingsApiKeys,
	          loadSettingsTriggers,
	        ]);
        useEffect(() => {
          if (activePage !== "develop-api-keys" || !hasSessionAuth) {
            return undefined;
          }

          const period = developApiKeysAnalyticsPeriod === "day" || developApiKeysAnalyticsPeriod === "week"
            ? developApiKeysAnalyticsPeriod
            : "month";
          const identity = String(sessionState.userId || sessionState.email || accountEmail || "session").trim();
          let headerSignature = "";
          try {
            headerSignature = Array.from(new Headers(authRequestHeaders || {}).entries())
              .sort(([left], [right]) => left.localeCompare(right))
              .map(([key, value]) => key + ":" + value)
              .join("|");
          } catch {}
          const scopeKey = String(proxyBackendBase || "").replace(new RegExp("/+$"), "")
            + "|" + identity + "|" + headerSignature;
          const requestOptions = {
            backendUrl: proxyBackendBase,
            headers: authRequestHeaders,
            identity,
            period,
          };
          const cached = readCachedApiKeysOverviewAnalytics(requestOptions);
          setDevelopApiKeysAnalyticsState((current) => {
            const isSameScope = current.scopeKey === scopeKey;
            const currentDataByPeriod = isSameScope ? current.dataByPeriod : {};
            return {
              scopeKey,
              dataByPeriod: cached?.data
                ? { ...currentDataByPeriod, [period]: cached.data }
                : currentDataByPeriod,
              loadingPeriod: cached?.data ? "" : period,
              errorsByPeriod: isSameScope ? { ...current.errorsByPeriod, [period]: "" } : {},
            };
          });

          let isActive = true;
          void fetchApiKeysOverviewAnalytics(requestOptions).then((data) => {
            if (!isActive) return;
            setDevelopApiKeysAnalyticsState((current) => {
              if (current.scopeKey !== scopeKey) return current;
              return {
                ...current,
                dataByPeriod: { ...current.dataByPeriod, [period]: data },
                loadingPeriod: current.loadingPeriod === period ? "" : current.loadingPeriod,
                errorsByPeriod: { ...current.errorsByPeriod, [period]: "" },
              };
            });
          }).catch((error) => {
            if (!isActive) return;
            const endpointUnavailable = error instanceof ApiKeysOverviewAnalyticsRequestError
              && (error.status === 404 || error.status === 501);
            setDevelopApiKeysAnalyticsState((current) => {
              if (current.scopeKey !== scopeKey) return current;
              return {
                ...current,
                loadingPeriod: current.loadingPeriod === period ? "" : current.loadingPeriod,
                errorsByPeriod: {
                  ...current.errorsByPeriod,
                  [period]: endpointUnavailable
                    ? ""
                    : error instanceof Error
                      ? error.message
                      : "Failed to load API key analytics.",
                },
              };
            });
          });

          return () => {
            isActive = false;
          };
        }, [
          accountEmail,
          activePage,
          authRequestHeaders,
          developApiKeysAnalyticsPeriod,
          developApiKeysAnalyticsRefreshToken,
          hasSessionAuth,
          proxyBackendBase,
          sessionState.email,
          sessionState.userId,
        ]);
`;

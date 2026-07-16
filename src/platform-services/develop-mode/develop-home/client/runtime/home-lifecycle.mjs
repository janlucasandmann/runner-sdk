export const DEVELOP_HOME_METRICS_LIFECYCLE_SCRIPT = `        useEffect(() => {
          if (activePage !== "develop" || !hasSessionAuth) {
            return;
          }

          void loadDevelopServerOperationalMetrics({
            period: developHomeChartTimescale,
          });
          void loadSettingsUsageData();
        }, [
          activePage,
          developHomeChartTimescale,
          hasSessionAuth,
          loadDevelopServerOperationalMetrics,
          loadSettingsUsageData,
        ]);
`;

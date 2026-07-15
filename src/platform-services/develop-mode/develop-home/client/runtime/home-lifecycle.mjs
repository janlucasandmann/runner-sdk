export const DEVELOP_HOME_METRICS_LIFECYCLE_SCRIPT = `        useEffect(() => {
          if (activePage !== "develop" || !hasSessionAuth || developHomeSection !== "overview") {
            return;
          }

          void loadDevelopServerOperationalMetrics();
        }, [
          activePage,
          developHomeSection,
          hasSessionAuth,
          loadDevelopServerOperationalMetrics,
        ]);
`;

export const DEVELOP_RESOURCE_METRICS_LIFECYCLE_SCRIPT = `        useEffect(() => {
          if (
            activePage === "resources"
            && activeResourcesView === "servers"
            && activeResourcesServerKind === "database"
            && resourcesHeaderState.mode === "detail"
            && resourcesHeaderState.resourceType === "database"
          ) {
            developServerOperationalMetricsLoadSequenceRef.current += 1;
            if (developServerOperationalMetricsAbortRef.current) {
              developServerOperationalMetricsAbortRef.current.abort();
              developServerOperationalMetricsAbortRef.current = null;
            }
            setDevelopServerOperationalMetricsLoading(false);
          }
        }, [activePage, activeResourcesServerKind, activeResourcesView, resourcesHeaderState.mode, resourcesHeaderState.resourceId, resourcesHeaderState.resourceType]);

        useEffect(() => {
          if (
            activePage !== "resources"
            || activeResourcesView !== "servers"
            || resourcesHeaderState.mode !== "overview"
            || !activeResourcesServerKind
            || !hasSessionAuth
          ) {
            return;
          }
          const rawMetricsScopeKind = String(developServerOperationalMetrics?.scopeKind || "").trim();
          const metricsScopeKind = rawMetricsScopeKind ? canonicalizePlaygroundServerKind(rawMetricsScopeKind) : "";
          const requestedMetricsPeriod = normalizePlaygroundEnvironmentHomeChartPeriod(developServerOperationalMetricsPeriod);
          const requestedMetricsKey = activeResourcesServerKind + ":" + requestedMetricsPeriod;
          if (
            developServerOperationalMetricsLoading
            && developServerOperationalMetricsRequestKeyRef.current === requestedMetricsKey
          ) {
            return;
          }
          const loadedMetricsPeriod = String(developServerOperationalMetrics?.period || "day").trim();
          const loadedAt = Date.parse(String(developServerOperationalMetrics?.loadedAt || ""));
          const shouldRefresh = metricsScopeKind !== activeResourcesServerKind
            || loadedMetricsPeriod !== requestedMetricsPeriod
            || !Number.isFinite(loadedAt)
            || Date.now() - loadedAt > 60000;
          if (!shouldRefresh) {
            return;
          }
          void loadDevelopServerOperationalMetrics({
            resourceKind: activeResourcesServerKind,
            period: requestedMetricsPeriod,
          });
        }, [
          activePage,
          activeResourcesServerKind,
          activeResourcesView,
          developServerOperationalMetrics?.loadedAt,
          developServerOperationalMetrics?.period,
          developServerOperationalMetrics?.scopeKind,
          developServerOperationalMetricsLoading,
          developServerOperationalMetricsPeriod,
          hasSessionAuth,
          loadDevelopServerOperationalMetrics,
          resourcesHeaderState.mode,
        ]);
`;

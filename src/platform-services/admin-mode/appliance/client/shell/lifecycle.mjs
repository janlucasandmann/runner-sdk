export const APPLIANCE_ADMIN_LIFECYCLE_SCRIPT = `        const loadApplianceOverview = useCallback(async ({ refresh = false } = {}) => {
          if (platformDeploymentProfile.topology !== "on_prem") return;
          if (!refresh && applianceOverview) return;
          if (applianceOverviewAbortControllerRef.current) {
            applianceOverviewAbortControllerRef.current.abort();
          }
          const controller = new AbortController();
          applianceOverviewAbortControllerRef.current = controller;
          setApplianceOverviewLoading(true);
          setApplianceOverviewError("");
          try {
            const response = await fetch("/api/real/admin/appliance-overview", {
              method: "GET",
              headers: baseAuthRequestHeaders,
              signal: controller.signal,
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(String(payload?.message || payload?.error || "Failed to load appliance information."));
            }
            if (!payload || Number(payload.schemaVersion) !== 1) {
              throw new Error("The appliance overview response is incompatible with this platform release.");
            }
            setApplianceOverview(payload);
          } catch (error) {
            if (error?.name !== "AbortError") {
              setApplianceOverviewError(error instanceof Error ? error.message : String(error));
            }
          } finally {
            if (applianceOverviewAbortControllerRef.current === controller) {
              applianceOverviewAbortControllerRef.current = null;
              setApplianceOverviewLoading(false);
            }
          }
        }, [applianceOverview, baseAuthRequestHeaders]);

        useEffect(() => {
          if (
            activePage === "organization"
            && organizationPageActiveTab === "appliance"
            && platformDeploymentProfile.topology === "on_prem"
          ) {
            void loadApplianceOverview();
          }
        }, [activePage, loadApplianceOverview, organizationPageActiveTab]);

        useEffect(() => () => {
          if (applianceOverviewAbortControllerRef.current) {
            applianceOverviewAbortControllerRef.current.abort();
            applianceOverviewAbortControllerRef.current = null;
          }
        }, []);
`;

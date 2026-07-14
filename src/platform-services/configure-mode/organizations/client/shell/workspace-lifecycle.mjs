export const ORGANIZATIONS_WORKSPACE_LIFECYCLE_SCRIPT = `	        useEffect(() => {
	          writePlaygroundActiveOrganizationId(activeOrganizationId);
	        }, [activeOrganizationId]);
	        useEffect(() => {
	          if (settingsBillingScopeIdRef.current === billingOrganizationId) {
	            return;
	          }
	          settingsBillingScopeIdRef.current = billingOrganizationId;
	          setSettingsBudgetStatus(null);
	          setSettingsInvoices([]);
	          setSettingsSubscriptions([]);
	          setSettingsUsageSummary(createEmptySettingsUsageSummary());
	          setSettingsUsageBreakdown([]);
	          setSettingsUsageResourceItems([]);
	          setSettingsUsageAgentItems([]);
	          setSettingsUsageEnvironmentItems([]);
	          setOrganizationPageBillingSummary(null);
	          setSettingsBillingPeriodOffset(0);
	        }, [billingOrganizationId]);
	        useEffect(() => {
	          const nextScopeKey = String(activeOrganizationId || "").trim() || "__personal__";
	          if (activeOrganizationResourceScopeKeyRef.current === nextScopeKey) {
	            return;
	          }
	          activeOrganizationResourceScopeKeyRef.current = nextScopeKey;
	          setEnvironmentId("");
	          setPreferredAgentId("");
		          setCurrentThreadId("");
		          setRealThreads([]);
		          setRealThreadsHasMore(false);
		          setOptimisticMetronomeRunEntries({});
		          setMetronomeRunStatusByKey({});
		          setMetronomeRunTraceSelection(null);
		          setMetronomeRunTraceState({ key: "", status: "idle", run: null, error: "" });
		          metronomeSidebarRunsLoadKeyRef.current = "";
		          setRealAgents([]);
	          setRealEnvironments([]);
	          setRealProjects([]);
	          setSettingsTriggers([]);
	          setSettingsSelectedTriggerId("");
	          setSettingsTriggerForm((current) => ({
	            ...current,
	            environmentId: "",
	            agentId: "",
	          }));
            setGuardrailSets([]);
            setSelectedGuardrailSetId("");
            guardrailsBackendLoadRef.current = "";
            guardrailsBackendLoadedRef.current = false;
            guardrailDetailsLoadedRef.current = new Set();
            guardrailsBackendMigratedLocalRef.current = false;
            guardrailPersistSignaturesRef.current = new Map();
            guardrailPersistTimersRef.current.forEach((timer) => {
              if (typeof window !== "undefined") {
                window.clearTimeout(timer);
              } else {
                clearTimeout(timer);
              }
            });
            guardrailPersistTimersRef.current.clear();
            resetGuardrailVersionTransientState();
	          setTeamPageMetronomeWorkflows([]);
	        }, [activeOrganizationId]);
`;

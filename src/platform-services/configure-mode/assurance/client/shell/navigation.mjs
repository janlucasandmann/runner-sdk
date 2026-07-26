export const ASSURANCE_APP_NAVIGATION_SCRIPT = `        function openAssurancePage(options = {}) {
          setAccountMenuOpen(false);
          setProfileEditorOpen(false);
          if (!options.preserveSidebarMode) {
            setSidebarWorkspaceMode("configure");
          }
          setResourcesHeaderState({
            mode: "overview",
            title: "",
          });
          const requestedPolicyId = String(options.policyId || "").trim();
          const requestedRunId = String(options.runId || "").trim();
          const requestedPolicyName = String(options.policyName || "").trim();
          const requestedRunName = String(options.runName || "").trim();
          if (requestedPolicyId) setSelectedAssurancePolicyId(requestedPolicyId);
          if (requestedPolicyName) setSelectedAssurancePolicyName(requestedPolicyName);
          if (requestedRunId) setSelectedAssuranceRunId(requestedRunId);
          if (requestedRunName) setSelectedAssuranceRunName(requestedRunName);
          setAssurancePageMode(
            options.mode === "run" || requestedRunId
              ? "run"
              : options.mode === "detail" || requestedPolicyId
                ? "detail"
                : "overview"
          );
          setActivePage("assurance");
        }

        function openAssuranceOverviewPage() {
          setSelectedAssurancePolicyId("");
          setSelectedAssurancePolicyName("");
          setSelectedAssuranceRunId("");
          setSelectedAssuranceRunName("");
          openAssurancePage({ mode: "overview" });
        }

        function openAssurancePolicyDetailPage(policyId, policyName = "") {
          const normalizedPolicyId = String(policyId || "").trim();
          if (!normalizedPolicyId) {
            openAssuranceOverviewPage();
            return;
          }
          setSelectedAssuranceRunId("");
          setSelectedAssuranceRunName("");
          openAssurancePage({
            mode: "detail",
            policyId: normalizedPolicyId,
            policyName,
          });
        }

        function openAssuranceRunDetailPage(policyId, runId, policyName = "", runName = "") {
          const normalizedPolicyId = String(policyId || "").trim();
          const normalizedRunId = String(runId || "").trim();
          if (!normalizedRunId) {
            openAssurancePolicyDetailPage(normalizedPolicyId, policyName);
            return;
          }
          openAssurancePage({
            mode: "run",
            policyId: normalizedPolicyId,
            runId: normalizedRunId,
            policyName,
            runName,
          });
        }

`;

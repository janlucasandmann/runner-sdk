export const ASSURANCE_APP_HISTORY_RESTORE_SCRIPT = `          if (entry.page === "assurance") {
            openAssurancePage({
              mode: entry.mode === "run" ? "run" : entry.mode === "detail" ? "detail" : "overview",
              policyId: entry.assurancePolicyId || "",
              policyName: entry.assurancePolicyName || "",
              runId: entry.assuranceRunId || "",
              runName: entry.assuranceRunName || "",
            });
            return;
          }

`;

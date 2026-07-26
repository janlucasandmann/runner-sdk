export const ASSURANCE_APP_HISTORY_CAPTURE_SCRIPT = `          if (activePage === "assurance") {
            return {
              page: "assurance",
              mode: assurancePageMode,
              assurancePolicyId: selectedAssurancePolicyId,
              assurancePolicyName: selectedAssurancePolicyName,
              assuranceRunId: selectedAssuranceRunId,
              assuranceRunName: selectedAssuranceRunName,
            };
          }

`;

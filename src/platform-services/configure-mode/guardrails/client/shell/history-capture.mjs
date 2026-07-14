export const GUARDRAILS_APP_HISTORY_CAPTURE_SCRIPT = `          if (activePage === "guardrails") {
            return {
              page: "guardrails",
              mode: guardrailsPageMode === "detail" ? "detail" : "overview",
              guardrailId: selectedGuardrailSetId,
            };
          }

`;

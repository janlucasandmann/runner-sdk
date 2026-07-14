export const GUARDRAILS_APP_HISTORY_RESTORE_SCRIPT = `          if (entry.page === "guardrails") {
            openGuardrailsPage({
              mode: entry.mode === "detail" ? "detail" : "overview",
              guardrailId: entry.guardrailId || "",
            });
            return;
          }

`;

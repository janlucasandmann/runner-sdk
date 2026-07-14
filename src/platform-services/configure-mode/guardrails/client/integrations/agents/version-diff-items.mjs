export const GUARDRAILS_AGENT_VERSION_DIFF_ITEMS_SCRIPT = `        function getAgentVersionGuardrailDiffItems(snapshot) {
          const guardrailNamesById = new Map((Array.isArray(guardrailSets) ? guardrailSets : [])
            .map((guardrailSet) => [String(guardrailSet?.id || "").trim(), String(guardrailSet?.name || guardrailSet?.title || guardrailSet?.id || "").trim()])
          );
          return normalizeAgentVersionComparableList(snapshot?.guardrailSetIds)
            .map((guardrailSetId) => ({
              id: guardrailSetId,
              label: guardrailNamesById.get(guardrailSetId) || guardrailSetId,
            }));
        }

`;

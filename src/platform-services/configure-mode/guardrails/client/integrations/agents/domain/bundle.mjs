export const GUARDRAILS_AGENT_BUNDLE_SCRIPT = `      function buildPlaygroundAgentGuardrailBundle(agent, availableGuardrailSets) {
        const guardrailSetIds = getPlaygroundAgentGuardrailSetIds(agent);
        const availableById = new Map(
          (Array.isArray(availableGuardrailSets) ? availableGuardrailSets : [])
            .map((set) => normalizePlaygroundGuardrailSet(set))
            .filter((set) => set?.id)
            .map((set) => [set.id, set])
        );
        const existingSnapshots = getPlaygroundAgentGuardrailSnapshots(agent);
        const existingById = new Map(existingSnapshots.map((set) => [set.id, set]));
        const guardrails = guardrailSetIds
          .map((setId) => availableById.get(setId) || existingById.get(setId) || null)
          .filter(Boolean)
          .map((set) => normalizePlaygroundGuardrailSet(set));
        const promptAdaptations = buildPlaygroundGuardrailPromptAdaptations(guardrails);
        return {
          guardrailSetIds,
          guardrails,
          promptAdaptations,
        };
      }

`;

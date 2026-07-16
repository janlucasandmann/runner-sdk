export const GUARDRAILS_AGENT_PAGE_MODEL_SCRIPT = `          const availableAgentGuardrailSets = (Array.isArray(guardrailSets) ? guardrailSets : [])
            .map((set) => normalizePlaygroundGuardrailSet(set))
            .filter((set) => set?.id);
          const agentGuardrailSetIds = normalizePlaygroundGuardrailSetIds(draftAgent.guardrailSetIds);
          const agentGuardrailSetIdLookup = new Set(agentGuardrailSetIds);
          const importedAgentGuardrailSets = agentGuardrailSetIds
            .map((setId) => availableAgentGuardrailSets.find((set) => set.id === setId) || null)
            .filter(Boolean);
          const importableAgentGuardrailSets = availableAgentGuardrailSets.filter((set) => !agentGuardrailSetIdLookup.has(set.id));
          function getAgentGuardrailSearchText(set) {
            const promptText = (Array.isArray(set.prompts) ? set.prompts : [])
              .map((prompt) => [prompt?.title, prompt?.prompt].filter(Boolean).join(" "))
              .join(" ");
            return [
              set.name,
              set.description,
              promptText,
            ].filter(Boolean).join(" ");
          }
          const filteredAgentGuardrailSets = importedAgentGuardrailSets.filter((set) => {
            const promptCount = Array.isArray(set.prompts) ? set.prompts.length : 0;
            if (agentGuardrailFilterMode === "with-prompts") {
              return promptCount > 0;
            }
            if (agentGuardrailFilterMode === "without-prompts") {
              return promptCount === 0;
            }
            return true;
          });
          function formatAgentGuardrailDate(value) {
            const date = new Date(value || "");
            if (Number.isNaN(date.getTime())) {
              return "—";
            }
            return date.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
          }
          function toggleAgentGuardrailSet(setId) {
            if (isDefaultAgentConfigurationLocked) {
              return;
            }
            const normalizedSetId = String(setId || "").trim();
            if (!normalizedSetId) {
              return;
            }
            const currentIds = normalizePlaygroundGuardrailSetIds(draftAgent.guardrailSetIds);
            const nextIds = currentIds.includes(normalizedSetId)
              ? currentIds.filter((id) => id !== normalizedSetId)
              : [...currentIds, normalizedSetId];
            updateAgentField("guardrailSetIds", nextIds);
            if (draftAgent?.id && draftAgent.id !== PLAYGROUND_AGENT_DRAFT_ID) {
              const nextAgent = normalizePlaygroundAgentRecord({
                ...draftAgent,
                guardrailSetIds: nextIds,
              });
              void persistAgentDetailRecordImmediate(nextAgent, "Failed to update agent guardrails.").catch(() => {});
            }
          }
`;

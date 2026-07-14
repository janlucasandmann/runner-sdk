export const GUARDRAILS_AGENT_ADAPTATIONS_SCRIPT = `      function normalizePlaygroundPromptAdaptations(value) {
        const source = Array.isArray(value) ? value : [];
        return source
          .filter((item) => item && typeof item === "object" && !Array.isArray(item))
          .map((item) => ({
            id: String(item.id || item.promptId || item.prompt_id || "").trim(),
            title: String(item.title || item.name || "Guardrail").trim(),
            content: String(item.content || item.prompt || item.text || ""),
            prompt: String(item.prompt || item.content || item.text || ""),
            guardrailSetId: String(item.guardrailSetId || item.guardrail_set_id || item.setId || item.set_id || "").trim(),
            guardrailSetName: String(item.guardrailSetName || item.guardrail_set_name || item.setName || item.set_name || "").trim(),
            source: String(item.source || "guardrail").trim() || "guardrail",
          }))
          .filter((item) => item.id && item.content.trim());
      }

      function buildPlaygroundGuardrailPromptAdaptations(guardrailSets) {
        const adaptations = [];
        const seen = new Set();
        (Array.isArray(guardrailSets) ? guardrailSets : []).forEach((set) => {
          const normalizedSet = normalizePlaygroundGuardrailSet(set);
          (Array.isArray(normalizedSet.prompts) ? normalizedSet.prompts : []).forEach((prompt, promptIndex) => {
            const promptContent = String(prompt?.prompt || "").trim();
            if (!promptContent) {
              return;
            }
            const promptId = String(prompt?.id || "").trim() || (normalizedSet.id + "_prompt_" + promptIndex);
            const adaptationId = normalizedSet.id + ":" + promptId;
            if (seen.has(adaptationId)) {
              return;
            }
            seen.add(adaptationId);
            adaptations.push({
              id: adaptationId,
              title: String(prompt?.title || normalizedSet.name || "Guardrail").trim(),
              content: promptContent,
              prompt: promptContent,
              guardrailSetId: normalizedSet.id,
              guardrailSetName: normalizedSet.name,
              source: "guardrail",
            });
          });
        });
        return adaptations;
      }

`;

export const GUARDRAILS_AGENT_SELECTION_SCRIPT = `      function normalizePlaygroundGuardrailSetIds(value) {
        const source = Array.isArray(value)
          ? value
          : typeof value === "string" && value.includes(",")
            ? value.split(",")
            : value !== undefined && value !== null
              ? [value]
              : [];
        const seen = new Set();
        const result = [];
        source.forEach((item) => {
          const normalizedId = typeof item === "object" && item && !Array.isArray(item)
            ? String(item.id || item.guardrailSetId || item.guardrail_set_id || item.setId || item.set_id || "").trim()
            : String(item || "").trim();
          if (!normalizedId || seen.has(normalizedId)) {
            return;
          }
          seen.add(normalizedId);
          result.push(normalizedId);
        });
        return result;
      }

      function getPlaygroundAgentGuardrailSetIds(agent) {
        const source = agent && typeof agent === "object" && !Array.isArray(agent) ? agent : {};
        const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
          ? source.metadata
          : {};
        const metadataGuardrails = metadata.guardrailSetIds || metadata.guardrail_set_ids || metadata.guardrails;
        const directGuardrails = source.guardrailSetIds || source.guardrail_set_ids || source.guardrails;
        const directIds = normalizePlaygroundGuardrailSetIds(directGuardrails);
        if (directIds.length > 0 || Array.isArray(directGuardrails)) {
          return directIds;
        }
        return normalizePlaygroundGuardrailSetIds(metadataGuardrails);
      }

      function normalizePlaygroundAgentGuardrailSnapshots(value) {
        const source = Array.isArray(value) ? value : [];
        return source
          .filter((item) => item && typeof item === "object" && !Array.isArray(item))
          .map((set) => normalizePlaygroundGuardrailSet(set))
          .filter((set) => set?.id);
      }

      function getPlaygroundAgentGuardrailSnapshots(agent) {
        const source = agent && typeof agent === "object" && !Array.isArray(agent) ? agent : {};
        const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
          ? source.metadata
          : {};
        return normalizePlaygroundAgentGuardrailSnapshots(source.guardrails).length > 0
          ? normalizePlaygroundAgentGuardrailSnapshots(source.guardrails)
          : normalizePlaygroundAgentGuardrailSnapshots(metadata.guardrails);
      }

`;

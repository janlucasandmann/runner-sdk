export const GUARDRAILS_AGENT_VERSION_DIFF_PAYLOAD_SCRIPT = `        function buildAgentVersionGuardrailDiffPayload(snapshot) {
          const normalizedSnapshot = normalizePlaygroundAgentVersion({ snapshot }).snapshot;
          return {
            sets: getAgentVersionGuardrailDiffItems(normalizedSnapshot),
            invisiblePromptAdaptations: normalizeAgentVersionComparablePromptAdaptations(
              normalizedSnapshot.promptAdaptations || normalizedSnapshot.invisiblePromptAdaptations
            ),
          };
        }

`;
